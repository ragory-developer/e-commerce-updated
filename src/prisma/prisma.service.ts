// ─── Prisma Service for NestJS ───────────────────────────────
// Production-grade PrismaService with:
// - Soft delete middleware
// - Connection pooling logging
// - Graceful shutdown
// - Query logging in development

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { softDeleteMiddleware } from './prisma.soft-delete.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ],
    });
  }

  async onModuleInit() {
    // Register soft delete middleware
    this.$use(softDeleteMiddleware());

    // Query logging in development
    if (process.env.NODE_ENV === 'development') {
      (this as any).$on('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  // ─── Helper: Find including soft-deleted records ───────────
  // Use when admins need to see deleted items (e.g., "Trash" view)
  withDeleted() {
    return new PrismaClient();
  }

  // ─── Helper: Restore a soft-deleted record ─────────────────
  async restore<T extends keyof PrismaClient>(
    model: T,
    id: string,
    restoredBy?: string,
  ) {
    return (this[model] as any).update({
      where: { id, deletedAt: { not: null } },
      data: {
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date(),
      },
    });
  }

  // ─── Helper: Hard delete (permanently remove) ──────────────
  // Use with extreme caution — only for GDPR "right to be forgotten"
  async hardDelete<T extends keyof PrismaClient>(model: T, id: string) {
    const client = new PrismaClient();
    try {
      return await (client[model] as any).delete({
        where: { id },
      });
    } finally {
      await client.$disconnect();
    }
  }

  // ─── Helper: Cleanup old soft-deleted records ──────────────
  // Run via cron job: delete records soft-deleted more than X days ago
  async purgeDeletedRecords(model: string, olderThanDays: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const client = new PrismaClient();
    try {
      const result = await (client as any)[model].deleteMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate,
          },
        },
      });
      this.logger.log(
        `Purged ${result.count} ${model} records older than ${olderThanDays} days`,
      );
      return result;
    } finally {
      await client.$disconnect();
    }
  }
}
