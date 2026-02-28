import { AdminRole, AdminPermission, AuthUserType } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    type: AuthUserType;
    deviceId: string;
    role?: AdminRole;
    permissions?: AdminPermission[];
    iat?: number;
    exp?: number;
}
export interface RequestUser {
    id: string;
    type: AuthUserType;
    deviceId: string;
    role?: AdminRole;
    permissions?: AdminPermission[];
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface DeviceInfo {
    clientDeviceId: string;
    deviceName?: string;
    deviceType?: string;
    ipAddress?: string;
    userAgent?: string;
}
export interface AuthResult {
    tokens: TokenPair;
    deviceDbId: string;
}
export interface RegistrationTokenPayload {
    sub: string;
    purpose: 'REGISTRATION';
    iat?: number;
    exp?: number;
}
