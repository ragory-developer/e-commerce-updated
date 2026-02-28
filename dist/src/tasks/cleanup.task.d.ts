import { TokenService } from '../auth/token.service';
import { OtpService } from '../otp/otp.service';
export declare class CleanupTask {
    private readonly tokenService;
    private readonly otpService;
    private readonly logger;
    constructor(tokenService: TokenService, otpService: OtpService);
    cleanupExpiredTokens(): Promise<void>;
    cleanupExpiredOtps(): Promise<void>;
}
