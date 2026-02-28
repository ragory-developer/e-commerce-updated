import { PrismaService } from '../prisma/prisma.service';
import { PhoneOtpService } from '../otp/phone-otp.service';
import { TokenService } from './token.service';
import { CustomerCompleteRegistrationDto, CustomerPasswordLoginDto, CustomerOtpLoginVerifyDto, CustomerOtpLoginRequestDto, CustomerRequestOtpDto, ForgotPasswordDto, ResetPasswordDto, VerifyPhoneRequestDto, VerifyPhoneConfirmDto } from './dto';
import { DeviceInfo, AuthResult } from './auth.types';
export declare class CustomerAuthService {
    private readonly prisma;
    private readonly phoneOtpService;
    private readonly tokenService;
    private readonly logger;
    constructor(prisma: PrismaService, phoneOtpService: PhoneOtpService, tokenService: TokenService);
    requestRegistrationOtp(dto: CustomerRequestOtpDto, ipAddress?: string, userAgent?: string): Promise<{
        maskedPhone: string;
        expiresInSeconds: number;
    }>;
    verifyRegistrationOtp(phone: string, code: string): Promise<{
        registrationToken: string;
        maskedPhone: string;
    }>;
    completeRegistration(dto: CustomerCompleteRegistrationDto, deviceInfo: DeviceInfo): Promise<AuthResult>;
    loginWithPassword(dto: CustomerPasswordLoginDto, deviceInfo: DeviceInfo): Promise<AuthResult>;
    requestLoginOtp(dto: CustomerOtpLoginRequestDto, ipAddress?: string, userAgent?: string): Promise<{
        maskedPhone: string;
        expiresInSeconds: number;
    }>;
    loginWithOtp(dto: CustomerOtpLoginVerifyDto, deviceInfo: DeviceInfo): Promise<AuthResult>;
    requestPhoneVerification(dto: VerifyPhoneRequestDto, ipAddress?: string, userAgent?: string): Promise<{
        maskedPhone: string;
        expiresInSeconds: number;
    }>;
    confirmPhoneVerification(dto: VerifyPhoneConfirmDto): Promise<void>;
    requestPasswordReset(dto: ForgotPasswordDto, ipAddress?: string, userAgent?: string): Promise<{
        maskedPhone: string;
        expiresInSeconds: number;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    private incrementLoginAttempts;
}
