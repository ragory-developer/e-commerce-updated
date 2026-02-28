import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { AdminLoginDto } from './dto';
import { AuthResult, DeviceInfo } from './auth.types';
export declare class AdminAuthService {
    private readonly prisma;
    private readonly tokenService;
    private readonly logger;
    constructor(prisma: PrismaService, tokenService: TokenService);
    AdminLogin(dto: AdminLoginDto, deviceInfo: DeviceInfo): Promise<AuthResult>;
    seedSuperAdmin(): Promise<void>;
    private incrementLoginAttempts;
}
