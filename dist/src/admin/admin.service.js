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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const token_service_1 = require("../auth/token.service");
const auth_constants_1 = require("../auth/auth.constants");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    tokenService;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    async createAdmin(dto, callerRole, createdBy) {
        this.requireSuperAdmin(callerRole);
        if (dto.role === client_1.AdminRole.SUPERADMIN) {
            throw new common_1.ForbiddenException('Cannot create another SUPERADMIN');
        }
        const exists = await this.prisma.admin.findFirst({
            where: { email: dto.email.toLowerCase(), deletedAt: null },
            select: { id: true },
        });
        if (exists)
            throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.ADMIN_EMAIL_TAKEN);
        const hashedPassword = await bcrypt.hash(dto.password, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        const admin = await this.prisma.admin.create({
            data: {
                firstName: dto.firstName.trim(),
                lastName: dto.lastName.trim(),
                email: dto.email.toLowerCase(),
                phone: dto.phone ?? null,
                password: hashedPassword,
                role: dto.role ?? client_1.AdminRole.ADMIN,
                permissions: dto.permissions ?? [],
                isActive: true,
                createdBy,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                permissions: true,
                isActive: true,
                createdAt: true,
            },
        });
        this.logger.log(`Admin created: ${admin.email} by ${createdBy}`);
        return admin;
    }
    async listAdmins(callerRole) {
        this.requireSuperAdmin(callerRole);
        return this.prisma.admin.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                permissions: true,
                isActive: true,
                loginAttempts: true,
                lockedUntil: true,
                lastLoginAt: true,
                lastLoginIp: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAdmin(targetId, callerRole) {
        this.requireSuperAdmin(callerRole);
        return this.findActiveAdminOrFail(targetId);
    }
    async updatePermissions(targetId, dto, callerRole) {
        this.requireSuperAdmin(callerRole);
        if (!dto.add && !dto.remove && !dto.set) {
            throw new common_1.BadRequestException('Provide at least one of: add, remove, or set');
        }
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot modify SUPERADMIN permissions');
        let updatedPermissions;
        if (dto.set) {
            updatedPermissions = dto.set;
        }
        else {
            const current = new Set(target.permissions);
            dto.add?.forEach((p) => current.add(p));
            dto.remove?.forEach((p) => current.delete(p));
            updatedPermissions = Array.from(current);
        }
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { permissions: updatedPermissions },
        });
        this.logger.log(`Permissions updated for admin ${targetId}`);
        return { permissions: updatedPermissions };
    }
    async updateRole(targetId, dto, callerRole) {
        this.requireSuperAdmin(callerRole);
        if (dto.role === client_1.AdminRole.SUPERADMIN) {
            throw new common_1.ForbiddenException('Cannot promote to SUPERADMIN');
        }
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot change SUPERADMIN role');
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { role: dto.role },
        });
        this.logger.log(`Role updated for admin ${targetId} → ${dto.role}`);
    }
    async enableAdmin(targetId, callerRole, callerId) {
        this.requireSuperAdmin(callerRole);
        this.preventSelfModify(targetId, callerId, 'Cannot modify your own status');
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot enable/disable SUPERADMIN');
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { isActive: true },
        });
    }
    async disableAdmin(targetId, callerRole, callerId) {
        this.requireSuperAdmin(callerRole);
        this.preventSelfModify(targetId, callerId, 'Cannot modify your own status');
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot enable/disable SUPERADMIN');
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { isActive: false },
        });
        await this.tokenService.revokeAllOwnerTokens('ADMIN', targetId, 'All_DEVICES');
        this.logger.log(`Admin ${targetId} disabled by ${callerId}`);
    }
    async unlockAdmin(targetId, callerRole) {
        this.requireSuperAdmin(callerRole);
        await this.findActiveAdminOrFail(targetId);
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { loginAttempts: 0, lockedUntil: null },
        });
        this.logger.log(`Admin ${targetId} unlocked`);
    }
    async resetAdminPassword(targetId, newPassword, callerRole) {
        this.requireSuperAdmin(callerRole);
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot reset SUPERADMIN password');
        const hashed = await bcrypt.hash(newPassword, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        await this.prisma.admin.update({
            where: { id: targetId },
            data: { password: hashed },
        });
        await this.tokenService.revokeAllOwnerTokens('ADMIN', targetId, 'All_DEVICES');
        this.logger.log(`Password reset for admin ${targetId}`);
    }
    async deleteAdmin(targetId, callerRole, callerId) {
        this.requireSuperAdmin(callerRole);
        this.preventSelfModify(targetId, callerId, 'Cannot delete yourself');
        const target = await this.findActiveAdminOrFail(targetId);
        this.preventModifySuperAdmin(target.role, 'Cannot delete SUPERADMIN');
        await this.tokenService.revokeAllOwnerTokens('ADMIN', targetId, 'All_DEVICES');
        await this.prisma.softDelete('admin', targetId, callerId);
        this.logger.log(`Admin ${targetId} soft-deleted by ${callerId}`);
    }
    async getProfile(adminId) {
        const admin = await this.prisma.admin.findFirst({
            where: { id: adminId, deletedAt: null },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                permissions: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
        if (!admin)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.ADMIN_NOT_FOUND);
        return admin;
    }
    async updateProfile(adminId, dto) {
        await this.getProfile(adminId);
        return this.prisma.admin.update({
            where: { id: adminId },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                permissions: true,
            },
        });
    }
    async changePassword(adminId, dto) {
        const admin = await this.prisma.admin.findFirst({
            where: { id: adminId, deletedAt: null },
            select: { id: true, password: true },
        });
        if (!admin)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.ADMIN_NOT_FOUND);
        const valid = await bcrypt.compare(dto.currentPassword, admin.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { password: hashed },
        });
        await this.tokenService.revokeAllOwnerTokens('ADMIN', adminId, 'All_DEVICES');
    }
    requireSuperAdmin(role) {
        if (role !== client_1.AdminRole.SUPERADMIN) {
            throw new common_1.ForbiddenException(auth_constants_1.AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
        }
    }
    preventSelfModify(targetId, callerId, message) {
        if (targetId === callerId)
            throw new common_1.BadRequestException(message);
    }
    preventModifySuperAdmin(targetRole, message) {
        if (targetRole === client_1.AdminRole.SUPERADMIN)
            throw new common_1.ForbiddenException(message);
    }
    async findActiveAdminOrFail(adminId) {
        const admin = await this.prisma.admin.findFirst({
            where: { id: adminId, deletedAt: null },
            select: { id: true, role: true, permissions: true, isActive: true },
        });
        if (!admin)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.ADMIN_NOT_FOUND);
        return admin;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => token_service_1.TokenService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService])
], AdminService);
//# sourceMappingURL=admin.service.js.map