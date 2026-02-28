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
var AdminAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const token_service_1 = require("./token.service");
const auth_constants_1 = require("./auth.constants");
const bcrypt = __importStar(require("bcrypt"));
let AdminAuthService = AdminAuthService_1 = class AdminAuthService {
    prisma;
    tokenService;
    logger = new common_1.Logger(AdminAuthService_1.name);
    constructor(prisma, tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    async AdminLogin(dto, deviceInfo) {
        const admin = await this.prisma.admin.findFirst({
            where: { email: dto.email.toLowerCase(), deletedAt: null },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                permissions: true,
                isActive: true,
                loginAttempts: true,
                lockedUntil: true,
            },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.INVALID_CREDENTIALS);
        }
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_LOCKED);
        }
        if (!admin.isActive) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
        }
        const passwordValid = await bcrypt.compare(dto.password, admin.password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.INVALID_CREDENTIALS);
        }
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: deviceInfo.ipAddress ?? null,
            },
        });
        return this.tokenService.loginAndIssueTokens('ADMIN', admin.id, deviceInfo, admin.role, admin.permissions);
    }
    async seedSuperAdmin() {
        const email = process.env.SUPER_ADMIN_EMAIL;
        if (!email) {
            this.logger.warn('SUPER_ADMIN_EMAIL not set, skipping super admin seeding');
            return;
        }
        const existing = await this.prisma.admin.findFirst({
            where: { email: email.toLowerCase() },
            select: { id: true },
        });
        if (existing) {
            this.logger.log('Super admin already exists, skipping seed');
            return;
        }
        const { AdminPermission } = await import('@prisma/client');
        const hashedPassword = await bcrypt.hash(auth_constants_1.AUTH_CONFIG.SUPER_ADMIN_PASSWORD, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        await this.prisma.admin.create({
            data: {
                firstName: auth_constants_1.AUTH_CONFIG.SUPER_ADMIN_FIRST_NAME,
                lastName: auth_constants_1.AUTH_CONFIG.SUPER_ADMIN_LAST_NAME,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'SUPERADMIN',
                permissions: Object.values(AdminPermission),
                isActive: true,
            },
        });
        this.logger.log(`Super admin seeded: ${email}`);
    }
    async incrementLoginAttempts(id) {
        const admin = await this.prisma.admin.findFirst({
            where: { id, isActive: true },
        });
        const newAttempts = (admin?.loginAttempts ?? 0) + 1;
        const shouldLock = newAttempts >= auth_constants_1.AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
        await this.prisma.admin.update({
            where: { id },
            data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock
                    ? new Date(Date.now() + auth_constants_1.AUTH_CONFIG.LOCK_DURATION_MS)
                    : undefined,
            },
        });
        if (shouldLock) {
            this.logger.warn(`Admin ${id} locked due to too many failed login attempts`);
        }
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = AdminAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map