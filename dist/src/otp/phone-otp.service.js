"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PhoneOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const otp_service_1 = require("./otp.service");
const otp_constants_1 = require("./otp.constants");
let PhoneOtpService = PhoneOtpService_1 = class PhoneOtpService {
    otpService;
    configService;
    logger = new common_1.Logger(PhoneOtpService_1.name);
    constructor(otpService, configService) {
        this.otpService = otpService;
        this.configService = configService;
    }
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/[\s\-()+]/g, '');
        if (cleaned.startsWith('0')) {
            return '880' + cleaned.substring(1);
        }
        if (!cleaned.startsWith('880')) {
            return '880' + cleaned;
        }
        return cleaned;
    }
    generateSmsMessage(code, purpose) {
        const expirySeconds = otp_constants_1.OTP_CONFIG.EXPIRY_SECONDS[purpose] ?? 300;
        const expiryMinutes = Math.floor(expirySeconds / 60);
        const purposeTexts = {
            VERIFY_PHONE: 'Phone verification',
            VERIFY_EMAIL: 'Email verification',
            RESET_PASSWORD: 'Password reset',
            LOGIN_OTP: 'Login',
            REGISTER_ACCOUNT: 'Registration',
        };
        const purposeText = purposeTexts[purpose] ?? 'Verification';
        return `${purposeText} code is: ${code}. Valid for ${expiryMinutes} mins. Do not share.`;
    }
    async sendSms(phone, message) {
        const apiKey = this.configService.get('SMS_API_KEY');
        const senderId = this.configService.get('SMS_SENDER_ID');
        const baseUrl = this.configService.get('SMS_BASE_URL');
        if (!apiKey || !senderId || !baseUrl) {
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn(`[DEV] SMS not configured — would send to ${phone}: ${message}`);
                return;
            }
            throw new common_1.InternalServerErrorException('SMS configuration is incomplete');
        }
        const formattedPhone = this.formatPhoneNumber(phone);
        const url = new URL(`${baseUrl}/api/sms/send`);
        url.searchParams.append('apiKey', apiKey);
        url.searchParams.append('contactNumbers', formattedPhone);
        url.searchParams.append('senderId', senderId);
        url.searchParams.append('textBody', message);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url.toString(), {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`SMS API error (${response.status}): ${errorText}`);
                throw new Error(`SMS API returned ${response.status}`);
            }
            const result = await response.json();
            this.logger.debug('SMS API response:', result);
        }
        catch (error) {
            this.logger.error('Failed to send SMS', error);
            throw new common_1.InternalServerErrorException('Failed to send SMS verification');
        }
    }
    async sendOtp(options) {
        const rateLimit = await this.otpService.checkRateLimit(options.target, options.purpose);
        if (!rateLimit.allowed) {
            return {
                success: false,
                maskedTarget: this.otpService.maskTarget(options.target, 'SMS'),
                expiresInSeconds: 0,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
                message: otp_constants_1.OTP_ERROR.RATE_LIMIT,
            };
        }
        const onCooldown = await this.otpService.checkResendCooldown(options.target, options.purpose);
        if (onCooldown) {
            return {
                success: false,
                maskedTarget: this.otpService.maskTarget(options.target, 'SMS'),
                expiresInSeconds: 0,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
                message: otp_constants_1.OTP_ERROR.COOLDOWN,
            };
        }
        const code = this.otpService.generateCode();
        const codeHash = await this.otpService.hashCode(code);
        await this.otpService.storeOtp('SMS', options, codeHash);
        const message = this.generateSmsMessage(code, options.purpose);
        try {
            await this.sendSms(options.target, message);
            this.logger.log(`SMS OTP sent to ${this.otpService.maskTarget(options.target, 'SMS')}`);
            const expirySeconds = otp_constants_1.OTP_CONFIG.EXPIRY_SECONDS[options.purpose] ?? 300;
            return {
                success: true,
                maskedTarget: this.otpService.maskTarget(options.target, 'SMS'),
                expiresInSeconds: expirySeconds,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
            };
        }
        catch (error) {
            this.logger.error('Failed to send SMS OTP', error);
            throw new common_1.InternalServerErrorException('Failed to send SMS verification');
        }
    }
    async verifyOtp(options) {
        return this.otpService.verifyOtp(options);
    }
};
exports.PhoneOtpService = PhoneOtpService;
exports.PhoneOtpService = PhoneOtpService = PhoneOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [otp_service_1.OtpService,
        config_1.ConfigService])
], PhoneOtpService);
//# sourceMappingURL=phone-otp.service.js.map