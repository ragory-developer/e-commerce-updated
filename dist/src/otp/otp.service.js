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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const otp_constants_1 = require("./otp.constants");
let OtpService = OtpService_1 = class OtpService {
    prisma;
    logger = new common_1.Logger(OtpService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode() {
        const min = Math.pow(10, otp_constants_1.OTP_CONFIG.CODE_LENGTH - 1);
        const max = Math.pow(10, otp_constants_1.OTP_CONFIG.CODE_LENGTH) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
    async hashCode(code) {
        return await bcrypt.hash(code, 10);
    }
    async compareCode(code, hash) {
        return bcrypt.compare(code, hash);
    }
    maskTarget(target, channel) {
        if (channel === 'EMAIL') {
            const [local, domain] = target.split('@');
            if (!local || !domain)
                return '***@***';
            const visibleLocal = local.length > 2 ? local.substring(0, 2) : local[0];
            return `${visibleLocal}****@${domain}`;
        }
        else {
            if (target.length < 7)
                return '****';
            const start = target.substring(0, 4);
            const end = target.substring(target.length - 3);
            return `${start}****${end}`;
        }
    }
    async checkRateLimit(target, purpose) {
        const windowStart = new Date(Date.now() - otp_constants_1.OTP_CONFIG.RATE_LIMIT.WINDOW_MS);
        const count = await this.prisma.verificationOtp.count({
            where: {
                target,
                purpose,
                createdAt: { gte: windowStart },
            },
        });
        if (count >= otp_constants_1.OTP_CONFIG.RATE_LIMIT.MAX_PER_HOUR) {
            return {
                allowed: false,
                count,
                resetAt: new Date(windowStart.getTime() + otp_constants_1.OTP_CONFIG.RATE_LIMIT.WINDOW_MS),
            };
        }
        return { allowed: true, count };
    }
    async checkResendCooldown(target, purpose) {
        const cooldownEnd = new Date(Date.now() - otp_constants_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000);
        const recent = await this.prisma.verificationOtp.findFirst({
            where: {
                target,
                purpose,
                createdAt: { gte: cooldownEnd },
            },
            orderBy: { createdAt: 'desc' },
        });
        return !!recent;
    }
    async storeOtp(channel, options, codeHash) {
        const expirySeconds = otp_constants_1.OTP_CONFIG.EXPIRY_SECONDS[options.purpose];
        const expiresAt = new Date(Date.now() + expirySeconds * 1000);
        await this.prisma.verificationOtp.updateMany({
            where: {
                target: options.target,
                purpose: options.purpose,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            data: {
                expiresAt: new Date(),
            },
        });
        await this.prisma.verificationOtp.create({
            data: {
                channel,
                purpose: options.purpose,
                target: options.target,
                codeHash,
                expiresAt,
                attempts: 0,
                maxAttempts: otp_constants_1.OTP_CONFIG.MAX_ATTEMPTS,
                verified: false,
                ipAddress: options.ipAddress || null,
                userAgent: options.userAgent || null,
            },
        });
        this.logger.log(`OTP stored for ${this.maskTarget(options.target, channel)} (${options.purpose})`);
    }
    async verifyOtp(options) {
        const otp = await this.prisma.verificationOtp.findFirst({
            where: {
                target: options.target,
                purpose: options.purpose,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp) {
            return { success: false, message: otp_constants_1.OTP_ERROR.NOT_FOUND };
        }
        if (otp.expiresAt < new Date()) {
            return { success: false, message: otp_constants_1.OTP_ERROR.EXPIRED };
        }
        if (otp.attempts >= otp.maxAttempts) {
            return { success: false, message: otp_constants_1.OTP_ERROR.MAX_ATTEMPTS };
        }
        const isValid = await this.compareCode(options.code, otp.codeHash);
        if (!isValid) {
            await this.prisma.verificationOtp.update({
                where: { id: otp.id },
                data: { attempts: otp.attempts + 1 },
            });
            if (otp.attempts + 1 >= otp.maxAttempts) {
                return { success: false, message: otp_constants_1.OTP_ERROR.MAX_ATTEMPTS };
            }
            return { success: false, message: otp_constants_1.OTP_ERROR.INVALID };
        }
        if (options.consume) {
            await this.prisma.verificationOtp.update({
                where: { id: otp.id },
                data: {
                    verified: true,
                    verifiedAt: new Date(),
                },
            });
        }
        this.logger.log(`OTP verified for ${this.maskTarget(options.target, otp.channel)} (${options.purpose})`);
        return { success: true, verified: true };
    }
    async cleanupExpiredOtps() {
        const result = await this.prisma.verificationOtp.deleteMany({
            where: {
                OR: [
                    {
                        verified: true,
                        verifiedAt: { lt: new Date(Date.now() - 86400000) },
                    },
                    { expiresAt: { lt: new Date() } },
                ],
            },
        });
        this.logger.log(`Cleaned up ${result.count} expired OTP records`);
        return result.count;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OtpService);
//# sourceMappingURL=otp.service.js.map