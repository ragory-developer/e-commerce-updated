import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { CustomerAuthService } from './customer-auth.service';
import { TokenService } from './token.service';
import { AdminService } from '../admin/admin.service';
import { CustomerService } from '../customer/customer.service';
import { AdminLoginDto, CustomerRequestOtpDto, CustomerVerifyRegistrationOtpDto, CustomerCompleteRegistrationDto, CustomerPasswordLoginDto, CustomerOtpLoginRequestDto, CustomerOtpLoginVerifyDto, VerifyPhoneRequestDto, VerifyPhoneConfirmDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, LogoutDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from './auth.types';
export declare class AuthController {
    private readonly adminAuthService;
    private readonly customerAuthService;
    private readonly tokenService;
    private readonly adminService;
    private readonly customerService;
    private readonly prisma;
    constructor(adminAuthService: AdminAuthService, customerAuthService: CustomerAuthService, tokenService: TokenService, adminService: AdminService, customerService: CustomerService, prisma: PrismaService);
    adminLogin(dto: AdminLoginDto, req: Request): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    requestRegistrationOtp(dto: CustomerRequestOtpDto, req: Request): Promise<{
        message: string;
        data: {
            maskedPhone: string;
            expiresInSeconds: number;
        };
    }>;
    verifyRegistrationOtp(dto: CustomerVerifyRegistrationOtpDto): Promise<{
        message: string;
        data: {
            registrationToken: string;
            maskedPhone: string;
        };
    }>;
    completeRegistration(dto: CustomerCompleteRegistrationDto, req: Request): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    customerPasswordLogin(dto: CustomerPasswordLoginDto, req: Request): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    requestLoginOtp(dto: CustomerOtpLoginRequestDto, req: Request): Promise<{
        message: string;
        data: {
            maskedPhone: string;
            expiresInSeconds: number;
        };
    }>;
    customerOtpLogin(dto: CustomerOtpLoginVerifyDto, req: Request): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    requestPhoneVerification(dto: VerifyPhoneRequestDto, req: Request): Promise<{
        message: string;
        data: {
            maskedPhone: string;
            expiresInSeconds: number;
        };
    }>;
    confirmPhoneVerification(dto: VerifyPhoneConfirmDto): Promise<{
        message: string;
        data: null;
    }>;
    forgotPassword(dto: ForgotPasswordDto, req: Request): Promise<{
        message: string;
        data: {
            maskedPhone: string;
            expiresInSeconds: number;
        };
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
        data: null;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(dto: LogoutDto, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    logoutAll(user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    getMe(user: RequestUser): Promise<{
        message: string;
        data: {
            userType: string;
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import("@prisma/client").$Enums.AdminRole;
            permissions: import("@prisma/client").$Enums.AdminPermission[];
            isActive: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
        };
    } | {
        message: string;
        data: {
            userType: string;
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string | null;
            phone: string;
            avatar: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            emailVerified: boolean;
            phoneVerified: boolean;
            isGuest: boolean;
        };
    }>;
    getDevices(user: RequestUser): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            deviceId: string;
            deviceName: string | null;
            deviceType: string | null;
            ipAddress: string | null;
            lastActiveAt: Date;
        }[];
    }>;
    revokeDevice(deviceDbId: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
}
