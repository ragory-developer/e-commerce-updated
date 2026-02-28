"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const otp_service_1 = require("./otp.service");
const otp_constants_1 = require("./otp.constants");
let EmailOtpService = EmailOtpService_1 = class EmailOtpService {
    otpService;
    configService;
    logger = new common_1.Logger(EmailOtpService_1.name);
    transporter;
    constructor(otpService, configService) {
        this.otpService = otpService;
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: this.configService.get('EMAIL_SECURE') ?? false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
        });
    }
    getSubject(purpose) {
        const subjects = {
            VERIFY_EMAIL: 'Verify Your Email Address',
            VERIFY_PHONE: 'Phone Verification Code',
            RESET_PASSWORD: 'Password Reset Code',
            LOGIN_OTP: 'Your Login Code',
            REGISTER_ACCOUNT: 'Complete Your Registration',
        };
        return subjects[purpose] ?? 'Verification Code';
    }
    generateEmailHtml(code, purpose, recipientName, expiryMinutes) {
        const purposeTexts = {
            VERIFY_EMAIL: {
                title: 'Verify Your Email',
                action: 'verify your email address',
            },
            VERIFY_PHONE: {
                title: 'Phone Verification',
                action: 'verify your phone number',
            },
            RESET_PASSWORD: {
                title: 'Reset Your Password',
                action: 'reset your password',
            },
            LOGIN_OTP: {
                title: 'Login Verification',
                action: 'log in to your account',
            },
            REGISTER_ACCOUNT: {
                title: 'Complete Registration',
                action: 'complete your registration',
            },
        };
        const { title, action } = purposeTexts[purpose] ?? {
            title: 'Verification',
            action: 'complete verification',
        };
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${recipientName || 'there'},
              </p>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Use the following code to ${action}:
              </p>

              <!-- OTP Code Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                <div style="font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>

              <!-- Expiry Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 30px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>.
                </p>
              </div>

              <!-- Security Warning -->
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                🔒 <strong>Security tip:</strong> Never share this code with anyone. We will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    }
    generateEmailText(code, purpose, recipientName, expiryMinutes) {
        const purposeTexts = {
            VERIFY_EMAIL: 'verify your email address',
            VERIFY_PHONE: 'verify your phone number',
            RESET_PASSWORD: 'reset your password',
            LOGIN_OTP: 'log in to your account',
            REGISTER_ACCOUNT: 'complete your registration',
        };
        const action = purposeTexts[purpose] ?? 'complete verification';
        return `
Hi ${recipientName || 'there'},

Your verification code is: ${code}

Use this code to ${action}.

This code will expire in ${expiryMinutes} minutes.

Security tip: Never share this code with anyone.

If you didn't request this code, please ignore this email.
    `.trim();
    }
    async sendOtp(options) {
        const rateLimit = await this.otpService.checkRateLimit(options.target, options.purpose);
        if (!rateLimit.allowed) {
            return {
                success: false,
                maskedTarget: this.otpService.maskTarget(options.target, 'EMAIL'),
                expiresInSeconds: 0,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
                message: otp_constants_1.OTP_ERROR.RATE_LIMIT,
            };
        }
        const onCooldown = await this.otpService.checkResendCooldown(options.target, options.purpose);
        if (onCooldown) {
            return {
                success: false,
                maskedTarget: this.otpService.maskTarget(options.target, 'EMAIL'),
                expiresInSeconds: 0,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
                message: otp_constants_1.OTP_ERROR.COOLDOWN,
            };
        }
        const code = this.otpService.generateCode();
        const codeHash = await this.otpService.hashCode(code);
        await this.otpService.storeOtp('EMAIL', options, codeHash);
        const expirySeconds = otp_constants_1.OTP_CONFIG.EXPIRY_SECONDS[options.purpose] ?? 300;
        const expiryMinutes = Math.floor(expirySeconds / 60);
        try {
            await this.transporter.sendMail({
                from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM_ADDRESS')}>`,
                to: options.target,
                subject: this.getSubject(options.purpose),
                text: this.generateEmailText(code, options.purpose, options.recipientName ?? '', expiryMinutes),
                html: this.generateEmailHtml(code, options.purpose, options.recipientName ?? '', expiryMinutes),
            });
            this.logger.log(`Email OTP sent to ${this.otpService.maskTarget(options.target, 'EMAIL')}`);
            return {
                success: true,
                maskedTarget: this.otpService.maskTarget(options.target, 'EMAIL'),
                expiresInSeconds: expirySeconds,
                resendAfterSeconds: otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
            };
        }
        catch (error) {
            this.logger.error('Failed to send email OTP', error);
            throw new common_1.InternalServerErrorException('Failed to send verification email');
        }
    }
    async verifyOtp(options) {
        return this.otpService.verifyOtp(options);
    }
};
exports.EmailOtpService = EmailOtpService;
exports.EmailOtpService = EmailOtpService = EmailOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [otp_service_1.OtpService,
        config_1.ConfigService])
], EmailOtpService);
//# sourceMappingURL=email-otp.service.js.map