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
var CustomerAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const phone_otp_service_1 = require("../otp/phone-otp.service");
const token_service_1 = require("./token.service");
const auth_constants_1 = require("./auth.constants");
const mask_helper_1 = require("../common/helpers/mask.helper");
let CustomerAuthService = CustomerAuthService_1 = class CustomerAuthService {
    prisma;
    phoneOtpService;
    tokenService;
    logger = new common_1.Logger(CustomerAuthService_1.name);
    constructor(prisma, phoneOtpService, tokenService) {
        this.prisma = prisma;
        this.phoneOtpService = phoneOtpService;
        this.tokenService = tokenService;
    }
    async requestRegistrationOtp(dto, ipAddress, userAgent) {
        const existing = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, deletedAt: null },
            select: { id: true, isGuest: true },
        });
        if (existing && !existing.isGuest) {
            throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.CUSTOMER_PHONE_TAKEN);
        }
        const result = await this.phoneOtpService.sendOtp({
            target: dto.phone,
            purpose: 'REGISTER_ACCOUNT',
            ipAddress,
            userAgent,
        });
        if (!result.success) {
            throw new common_1.BadRequestException(result.message ?? 'Failed to send OTP');
        }
        return {
            maskedPhone: result.maskedTarget,
            expiresInSeconds: result.expiresInSeconds,
        };
    }
    async verifyRegistrationOtp(phone, code) {
        const otpResult = await this.phoneOtpService.verifyOtp({
            target: phone,
            purpose: 'REGISTER_ACCOUNT',
            code,
            consume: true,
        });
        if (!otpResult.success) {
            throw new common_1.UnauthorizedException(otpResult.message ?? auth_constants_1.AUTH_ERROR.OTP_INVALID);
        }
        const registrationToken = this.tokenService.generateRegistrationToken(phone);
        return {
            registrationToken,
            maskedPhone: (0, mask_helper_1.maskPhone)(phone),
        };
    }
    async completeRegistration(dto, deviceInfo) {
        const tokenPayload = this.tokenService.verifyRegistrationToken(dto.registrationToken);
        const phone = tokenPayload.sub;
        const existingPhone = await this.prisma.customer.findFirst({
            where: { phone, isGuest: false, deletedAt: null },
        });
        if (existingPhone)
            throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.CUSTOMER_PHONE_TAKEN);
        if (dto.email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email: dto.email.toLowerCase(), deletedAt: null },
            });
            if (existingEmail)
                throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.CUSTOMER_EMAIL_TAKEN);
        }
        const hashedPassword = await bcrypt.hash(dto.password, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        const guestAccount = await this.prisma.customer.findFirst({
            where: { phone, isGuest: true, deletedAt: null },
            select: { id: true },
        });
        let customerId;
        if (guestAccount) {
            const updated = await this.prisma.customer.update({
                where: { id: guestAccount.id },
                data: {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    email: dto.email?.toLowerCase() ?? null,
                    password: hashedPassword,
                    isGuest: false,
                    phoneVerified: true,
                    isActive: true,
                },
                select: { id: true },
            });
            customerId = updated.id;
        }
        else {
            const created = await this.prisma.customer.create({
                data: {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    phone,
                    email: dto.email?.toLowerCase() ?? null,
                    password: hashedPassword,
                    isGuest: false,
                    phoneVerified: true,
                    isActive: true,
                },
                select: { id: true },
            });
            customerId = created.id;
        }
        if (dto.address) {
            await this.prisma.address.create({
                data: {
                    customerId,
                    label: dto.address.label ?? 'Home',
                    address: dto.address.address,
                    descriptions: dto.address.descriptions ?? '',
                    city: dto.address.city,
                    state: dto.address.state,
                    road: dto.address.road ?? '',
                    zip: dto.address.zip,
                    country: dto.address.country,
                    isDefault: true,
                    createdBy: customerId,
                },
            });
        }
        this.logger.log(`Customer registered: ${phone}`);
        return this.tokenService.loginAndIssueTokens('CUSTOMER', customerId, deviceInfo);
    }
    async loginWithPassword(dto, deviceInfo) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, deletedAt: null },
            select: {
                id: true,
                password: true,
                isActive: true,
                isGuest: true,
                phoneVerified: true,
                loginAttempts: true,
                lockedUntil: true,
            },
        });
        if (!customer)
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.INVALID_CREDENTIALS);
        if (customer.lockedUntil && customer.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_LOCKED);
        }
        if (!customer.isActive)
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
        if (customer.isGuest || !customer.password) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.CUSTOMER_IS_GUEST);
        }
        const valid = await bcrypt.compare(dto.password, customer.password);
        if (!valid) {
            await this.incrementLoginAttempts(customer.id);
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.INVALID_CREDENTIALS);
        }
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: deviceInfo.ipAddress ?? null,
            },
        });
        return this.tokenService.loginAndIssueTokens('CUSTOMER', customer.id, deviceInfo);
    }
    async requestLoginOtp(dto, ipAddress, userAgent) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, isGuest: false, deletedAt: null },
            select: { id: true, isActive: true },
        });
        if (!customer || !customer.isActive) {
            return { maskedPhone: (0, mask_helper_1.maskPhone)(dto.phone), expiresInSeconds: 300 };
        }
        const result = await this.phoneOtpService.sendOtp({
            target: dto.phone,
            purpose: 'LOGIN_OTP',
            ipAddress,
            userAgent,
        });
        return {
            maskedPhone: result.maskedTarget,
            expiresInSeconds: result.expiresInSeconds,
        };
    }
    async loginWithOtp(dto, deviceInfo) {
        const otpResult = await this.phoneOtpService.verifyOtp({
            target: dto.phone,
            purpose: 'LOGIN_OTP',
            code: dto.code,
            consume: true,
        });
        if (!otpResult.success) {
            throw new common_1.UnauthorizedException(otpResult.message ?? auth_constants_1.AUTH_ERROR.OTP_INVALID);
        }
        const customer = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, isGuest: false, deletedAt: null },
            select: { id: true, isActive: true },
        });
        if (!customer || !customer.isActive) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.CUSTOMER_NOT_FOUND);
        }
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: deviceInfo.ipAddress ?? null,
            },
        });
        return this.tokenService.loginAndIssueTokens('CUSTOMER', customer.id, deviceInfo);
    }
    async requestPhoneVerification(dto, ipAddress, userAgent) {
        const result = await this.phoneOtpService.sendOtp({
            target: dto.phone,
            purpose: 'VERIFY_PHONE',
            ipAddress,
            userAgent,
        });
        if (!result.success) {
            throw new common_1.BadRequestException(result.message ?? 'Failed to send OTP');
        }
        return {
            maskedPhone: result.maskedTarget,
            expiresInSeconds: result.expiresInSeconds,
        };
    }
    async confirmPhoneVerification(dto) {
        const otpResult = await this.phoneOtpService.verifyOtp({
            target: dto.phone,
            purpose: 'VERIFY_PHONE',
            code: dto.code,
            consume: true,
        });
        if (!otpResult.success) {
            throw new common_1.UnauthorizedException(otpResult.message ?? auth_constants_1.AUTH_ERROR.OTP_INVALID);
        }
        await this.prisma.customer.updateMany({
            where: { phone: dto.phone, deletedAt: null },
            data: { phoneVerified: true },
        });
    }
    async requestPasswordReset(dto, ipAddress, userAgent) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, isGuest: false, deletedAt: null },
            select: { id: true },
        });
        if (!customer) {
            return { maskedPhone: (0, mask_helper_1.maskPhone)(dto.phone), expiresInSeconds: 300 };
        }
        const result = await this.phoneOtpService.sendOtp({
            target: dto.phone,
            purpose: 'RESET_PASSWORD',
            ipAddress,
            userAgent,
        });
        return {
            maskedPhone: result.maskedTarget,
            expiresInSeconds: result.expiresInSeconds,
        };
    }
    async resetPassword(dto) {
        const otpResult = await this.phoneOtpService.verifyOtp({
            target: dto.phone,
            purpose: 'RESET_PASSWORD',
            code: dto.code,
            consume: true,
        });
        if (!otpResult.success) {
            throw new common_1.UnauthorizedException(otpResult.message ?? auth_constants_1.AUTH_ERROR.OTP_INVALID);
        }
        const customer = await this.prisma.customer.findFirst({
            where: { phone: dto.phone, isGuest: false, deletedAt: null },
            select: { id: true },
        });
        if (!customer)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.CUSTOMER_NOT_FOUND);
        const hashedPassword = await bcrypt.hash(dto.newPassword, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: { password: hashedPassword },
        });
        await this.tokenService.revokeAllOwnerTokens('CUSTOMER', customer.id, 'All_DEVICES');
        this.logger.log(`Password reset for customer: ${dto.phone}`);
    }
    async incrementLoginAttempts(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: { loginAttempts: true },
        });
        const newAttempts = (customer?.loginAttempts ?? 0) + 1;
        const shouldLock = newAttempts >= auth_constants_1.AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
        await this.prisma.customer.update({
            where: { id: customerId },
            data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock
                    ? new Date(Date.now() + auth_constants_1.AUTH_CONFIG.LOCK_DURATION_MS)
                    : undefined,
            },
        });
        if (shouldLock) {
            this.logger.warn(`Customer ${customerId} locked after ${newAttempts} failed attempts`);
        }
    }
};
exports.CustomerAuthService = CustomerAuthService;
exports.CustomerAuthService = CustomerAuthService = CustomerAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phone_otp_service_1.PhoneOtpService,
        token_service_1.TokenService])
], CustomerAuthService);
//# sourceMappingURL=customer-auth.service.js.map