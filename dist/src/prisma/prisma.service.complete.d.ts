import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    withDeleted(): PrismaClient<Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    restore<T extends keyof PrismaClient>(model: T, id: string, restoredBy?: string): Promise<any>;
    hardDelete<T extends keyof PrismaClient>(model: T, id: string): Promise<any>;
    purgeDeletedRecords(model: string, olderThanDays?: number): Promise<any>;
}
