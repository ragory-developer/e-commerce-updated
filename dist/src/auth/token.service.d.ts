import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResult, DeviceInfo, JwtPayload, RegistrationTokenPayload, TokenPair } from './auth.types';
import { AdminPermission, AdminRole, AuthUserType } from '@prisma/client';
export declare class TokenService {
    private readonly jwtService;
    private readonly ConfigService;
    private readonly prisma;
    private readonly logger;
    constructor(jwtService: JwtService, ConfigService: ConfigService, prisma: PrismaService);
    private hashToken;
    private generateRefreshToken;
    generateAccessToken(payload: JwtPayload): string;
    generateRegistrationToken(phone: string): string;
    verifyRegistrationToken(token: string): RegistrationTokenPayload;
    upsertDevice(userType: AuthUserType, ownerId: string, deviceInfo: DeviceInfo): Promise<string>;
    issuesTokenPair(userType: AuthUserType, ownerId: string, deviceDbId: string, role?: AdminRole, permission?: AdminPermission[], tokenFamily?: string): Promise<TokenPair>;
    loginAndIssueTokens(userType: AuthUserType, ownerId: string, deviceInfo: DeviceInfo, role?: AdminRole, permission?: AdminPermission[]): Promise<AuthResult>;
    private revokeTokenFamily;
    rotateRefreshToken(rawRefreshToken: string, clientDeviceId?: string): Promise<{
        tokens: TokenPair;
        UserType: AuthUserType;
        ownerId: string;
    }>;
    revokeToken(rawRefreshToken: string): Promise<void>;
    revokeDeviceTokens(deviceDbId: string, reason?: string): Promise<void>;
    revokeAllOwnerTokens(userType: AuthUserType, ownerId: string, reason: 'All_DEVICES'): Promise<void>;
    cleanupExpiredTokens(): Promise<number>;
}
