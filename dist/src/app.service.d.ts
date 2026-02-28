import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getHello(): string;
    getHealth(): {
        message: string;
        data: {
            status: string;
            timestamp: string;
        };
    };
    getDetailedHealth(): Promise<{
        message: string;
        data: {
            status: string;
            database: string;
            uptime: number;
            timestamp: string;
            memory: NodeJS.MemoryUsage;
            nodeVersion: string;
        };
    }>;
}
