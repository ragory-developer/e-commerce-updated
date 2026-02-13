// ─── Scheduled Cleanup Tasks ─────────────────────────────────
// Essential cron jobs for production e-commerce

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupTask {
  private readonly logger = new Logger(CleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Every minute: Release expired stock reservations ──────
  @Cron('*/1 * * * *')
  async releaseExpiredReservations() {
    const result = await this.prisma.stockReservation.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
        releasedAt: new Date(),
      },
    });

    if (result.count > 0) {
      this.logger.log(`Released ${result.count} expired stock reservations`);
      // TODO: Restore stock quantities atomically
    }
  }

  // ─── Every hour: Clean expired sessions ────────────────────
  @Cron(CronExpression.EVERY_HOUR)
  async cleanExpiredSessions() {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revokedAt: {
              not: null,
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Revoked 7+ days ago
            },
          },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned ${result.count} expired sessions`);
    }
  }

  // ─── Daily 3 AM: Cleanup abandoned carts ───────────────────
  @Cron('0 3 * * *')
  async cleanAbandonedCarts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.cart.deleteMany({
      where: {
        updatedAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(`Cleaned ${result.count} abandoned carts`);
  }

  // ─── Daily 4 AM: Purge old queue job logs ──────────────────
  @Cron('0 4 * * *')
  async purgeOldQueueJobs() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.prisma.queueJob.deleteMany({
      where: {
        status: { in: ['COMPLETED', 'FAILED'] },
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    this.logger.log(`Purged ${result.count} old queue job logs`);
  }

  // ─── Weekly Sunday 2 AM: Purge soft-deleted records ────────
  @Cron('0 2 * * 0')
  async purgeSoftDeletedRecords() {
    const models = ['searchTerm', 'file'];
    // Only purge non-critical models. Products, Orders, Users stay forever.

    for (const model of models) {
      await this.prisma.purgeDeletedRecords(model, 180); // 6 months
    }
  }
}
