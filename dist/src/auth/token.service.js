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
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const auth_constants_1 = require("./auth.constants");
let TokenService = TokenService_1 = class TokenService {
    jwtService;
    ConfigService;
    prisma;
    logger = new common_1.Logger(TokenService_1.name);
    constructor(jwtService, ConfigService, prisma) {
        this.jwtService = jwtService;
        this.ConfigService = ConfigService;
        this.prisma = prisma;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            expiresIn: auth_constants_1.AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
            secret: this.ConfigService.getOrThrow('jwt.secret'),
        });
    }
    generateRegistrationToken(phone) {
        const payload = {
            sub: phone,
            purpose: 'REGISTRATION',
        };
        return this.jwtService.sign(payload, {
            expiresIn: auth_constants_1.REGISTRATION_TOKEN_EXPIRES_IN,
            secret: this.ConfigService.getOrThrow('jwt.secret'),
        });
    }
    verifyRegistrationToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.ConfigService.getOrThrow('jwt.secret'),
            });
            if (payload.purpose !== 'REGISTRATION') {
                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.OTP_REGISTRATION_TOKEN_INVALID);
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.OTP_REGISTRATION_TOKEN_INVALID);
        }
    }
    async upsertDevice(userType, ownerId, deviceInfo) {
        const isAdmin = userType === 'ADMIN';
        const ownerField = isAdmin ? { adminId: ownerId } : { customerId: ownerId };
        const existing = await this.prisma.device.findFirst({
            where: { ...ownerField, deviceId: deviceInfo.clientDeviceId },
            select: { id: true },
        });
        if (existing) {
            await this.prisma.device.update({
                where: { id: existing.id },
                data: {
                    isActive: true,
                    revokedAt: null,
                    lastActiveAt: new Date(),
                    deviceName: deviceInfo.deviceName ?? undefined,
                    deviceType: deviceInfo.deviceType ?? undefined,
                    userAgent: deviceInfo.userAgent ?? null,
                    ipAddress: deviceInfo.ipAddress ?? null,
                },
            });
            return existing.id;
        }
        const device = await this.prisma.device.create({
            data: {
                ...ownerField,
                userType,
                deviceId: deviceInfo.clientDeviceId,
                deviceName: deviceInfo.deviceName ?? null,
                deviceType: deviceInfo.deviceType ?? undefined,
                userAgent: deviceInfo.userAgent ?? null,
                ipAddress: deviceInfo.ipAddress ?? null,
            },
            select: { id: true },
        });
        return device.id;
    }
    async issuesTokenPair(userType, ownerId, deviceDbId, role, permission, tokenFamily) {
        const payload = {
            sub: ownerId,
            type: userType,
            deviceId: deviceDbId,
            role,
            permissions: permission,
        };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken();
        const hashedRefreshToken = this.hashToken(refreshToken);
        const family = tokenFamily ?? crypto.randomUUID();
        const expireAt = new Date(Date.now() + auth_constants_1.AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_MS);
        const ownerField = userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };
        await this.prisma.authToken.create({
            data: {
                userType,
                ...ownerField,
                deviceId: deviceDbId,
                tokenFamily: family,
                tokenHash: hashedRefreshToken,
                expiresAt: expireAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: auth_constants_1.AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN / 1000,
        };
    }
    async loginAndIssueTokens(userType, ownerId, deviceInfo, role, permission) {
        const deviceDbId = await this.upsertDevice(userType, ownerId, deviceInfo);
        const tokens = await this.issuesTokenPair(userType, ownerId, deviceDbId, role, permission);
        return { tokens, deviceDbId };
    }
    async revokeTokenFamily(tokenFamily, reason) {
        const tokens = await this.prisma.authToken.findMany({
            where: { tokenFamily },
            include: { device: true },
        });
        await this.prisma.authToken.updateMany({
            where: { tokenFamily },
            data: {
                revoked: true,
                revokedReason: reason,
                revokedAt: new Date(),
            },
        });
        const deviceIds = [
            ...new Set(tokens.map((t) => t.deviceId).filter(Boolean)),
        ];
        if (deviceIds.length > 0) {
            await this.prisma.device.updateMany({
                where: { id: { in: deviceIds } },
                data: { isActive: false, revokedAt: new Date() },
            });
        }
    }
    async rotateRefreshToken(rawRefreshToken, clientDeviceId) {
        const hashedToken = this.hashToken(rawRefreshToken);
        const tokenRecord = await this.prisma.authToken.findFirst({
            where: { tokenHash: hashedToken },
            include: { device: true },
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.TOKEN_INVALID);
        }
        if (tokenRecord.revoked) {
            this.logger.warn(`Refresh token reuse detected! Family: ${tokenRecord.tokenFamily}, Device: ${tokenRecord.deviceId}`);
            await this.revokeTokenFamily(tokenRecord.tokenFamily, 'SECURITY');
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.REFRESH_TOKEN_REUSE);
        }
        if (tokenRecord.expiresAt < new Date()) {
            await this.prisma.authToken.update({
                where: { id: tokenRecord.id },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: 'EXPIRED',
                },
            });
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.TOKEN_INVALID);
        }
        if (!tokenRecord.device || !tokenRecord.device.isActive) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.TOKEN_REVOKED);
        }
        const { userType, adminId, customerId, tokenFamily, deviceId } = tokenRecord;
        const ownerId = (adminId ?? customerId);
        if (!deviceId)
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.TOKEN_INVALID);
        if (userType === 'ADMIN') {
            const admin = await this.prisma.admin.findFirst({
                where: { id: ownerId, isActive: true, deletedAt: null },
                select: { id: true, role: true, permissions: true },
            });
            if (!admin)
                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
            await this.prisma.authToken.update({
                where: { id: tokenRecord.id },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: 'ROTATED',
                },
            });
            const tokens = await this.issuesTokenPair(userType, ownerId, deviceId, admin.role, admin.permissions, tokenFamily);
            return { tokens, UserType: userType, ownerId };
        }
        else {
            const customer = await this.prisma.customer.findFirst({
                where: { id: ownerId, isActive: true, deletedAt: null },
                select: { id: true },
            });
            if (!customer)
                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
            await this.prisma.authToken.update({
                where: { id: tokenRecord.id },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: 'ROTATED',
                },
            });
            const tokens = await this.issuesTokenPair(userType, ownerId, deviceId, undefined, undefined, tokenFamily);
            return { tokens, UserType: userType, ownerId };
        }
    }
    async revokeToken(rawRefreshToken) {
        const hashedToken = this.hashToken(rawRefreshToken);
        await this.prisma.authToken.updateMany({
            where: { tokenHash: hashedToken, revoked: false },
            data: {
                revoked: true,
                revokedAt: new Date(),
                revokedReason: 'LOGOUT',
            },
        });
    }
    async revokeDeviceTokens(deviceDbId, reason = 'LOGOUT') {
        await this.prisma.authToken.updateMany({
            where: { id: deviceDbId },
            data: { revoked: true, revokedAt: new Date(), revokedReason: reason },
        });
    }
    async revokeAllOwnerTokens(userType, ownerId, reason) {
        const ownerWhere = userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };
        await this.prisma.authToken.updateMany({
            where: { ...ownerWhere, revoked: false },
            data: {
                revoked: true,
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });
        await this.prisma.device.updateMany({
            where: { ...ownerWhere, isActive: true },
            data: { isActive: false, revokedAt: new Date() },
        });
    }
    async cleanupExpiredTokens() {
        const result = await this.prisma.authToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    {
                        revoked: true,
                        revokedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    },
                ],
            },
        });
        this.logger.log(`Cleaned up ${result.count} expired auth tokens`);
        return result.count;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map