import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { SendOtpOptions, SendOtpResult, VerifyOtpOptions, VerifyOtpResult } from './otp.types';
export declare class EmailOtpService {
    private readonly otpService;
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(otpService: OtpService, configService: ConfigService);
    private initializeTransporter;
    private getSubject;
    private generateEmailHtml;
    private generateEmailText;
    sendOtp(options: SendOtpOptions): Promise<SendOtpResult>;
    verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResult>;
}
