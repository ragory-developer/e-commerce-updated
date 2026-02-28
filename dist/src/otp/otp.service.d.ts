import { OtpChannel, OtpPurpose } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpOptions, VerifyOtpOptions, VerifyOtpResult, RateLimitCheck } from './otp.types';
export declare class OtpService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateCode(): string;
    hashCode(code: string): Promise<string>;
    compareCode(code: string, hash: string): Promise<boolean>;
    maskTarget(target: string, channel: OtpChannel): string;
    checkRateLimit(target: string, purpose: OtpPurpose): Promise<RateLimitCheck>;
    checkResendCooldown(target: string, purpose: OtpPurpose): Promise<boolean>;
    storeOtp(channel: OtpChannel, options: SendOtpOptions, codeHash: string): Promise<void>;
    verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResult>;
    cleanupExpiredOtps(): Promise<number>;
}
