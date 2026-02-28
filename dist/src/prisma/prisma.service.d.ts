import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    softDelete(model: string, id: string, deletedBy?: string): Promise<void>;
    restore(model: string, id: string): Promise<void>;
    hardDelete(model: string, id: string): Promise<void>;
    purgeDeletedRecords(model: string, olderThanDays?: number): Promise<number>;
}
