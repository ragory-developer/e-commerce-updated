import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { SendOtpOptions, SendOtpResult, VerifyOtpOptions, VerifyOtpResult } from './otp.types';
export declare class PhoneOtpService {
    private readonly otpService;
    private readonly configService;
    private readonly logger;
    constructor(otpService: OtpService, configService: ConfigService);
    private formatPhoneNumber;
    private generateSmsMessage;
    private sendSms;
    sendOtp(options: SendOtpOptions): Promise<SendOtpResult>;
    verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResult>;
}
