import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
