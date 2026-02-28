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
var CustomerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const token_service_1 = require("../auth/token.service");
const auth_constants_1 = require("../auth/auth.constants");
let CustomerService = CustomerService_1 = class CustomerService {
    prisma;
    tokenService;
    logger = new common_1.Logger(CustomerService_1.name);
    constructor(prisma, tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    async getProfile(customerId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, deletedAt: null },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                phoneVerified: true,
                email: true,
                emailVerified: true,
                isGuest: true,
                isActive: true,
                avatar: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
        if (!customer)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.CUSTOMER_NOT_FOUND);
        return customer;
    }
    async updateProfile(customerId, dto) {
        await this.getProfile(customerId);
        if (dto.email) {
            const emailTaken = await this.prisma.customer.findFirst({
                where: { email: dto.email, id: { not: customerId }, deletedAt: null },
                select: { id: true },
            });
            if (emailTaken)
                throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.CUSTOMER_EMAIL_TAKEN);
        }
        return this.prisma.customer.update({
            where: { id: customerId },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.email && { email: dto.email, emailVerified: false }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                emailVerified: true,
                phone: true,
                phoneVerified: true,
                avatar: true,
                isGuest: true,
            },
        });
    }
    async changePassword(customerId, dto) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, deletedAt: null },
            select: { id: true, password: true, isGuest: true },
        });
        if (!customer)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.CUSTOMER_NOT_FOUND);
        if (customer.isGuest || !customer.password) {
            throw new common_1.BadRequestException('No password set on this account. Use upgrade-to-account instead.');
        }
        const valid = await bcrypt.compare(dto.currentPassword, customer.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        await this.prisma.customer.update({
            where: { id: customerId },
            data: { password: hashed },
        });
        await this.tokenService.revokeAllOwnerTokens('CUSTOMER', customerId, 'All_DEVICES');
        this.logger.log(`Password changed for customer ${customerId}`);
    }
    async upgradeGuest(customerId, dto) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, deletedAt: null },
            select: {
                id: true,
                isGuest: true,
                phoneVerified: true,
                phone: true,
                email: true,
            },
        });
        if (!customer)
            throw new common_1.NotFoundException(auth_constants_1.AUTH_ERROR.CUSTOMER_NOT_FOUND);
        if (!customer.isGuest) {
            throw new common_1.BadRequestException('Account is already a full account');
        }
        if (!customer.phoneVerified) {
            throw new common_1.ForbiddenException('Phone must be verified before upgrading. Use POST /auth/customer/verify-phone/request first.');
        }
        if (dto.email) {
            const emailTaken = await this.prisma.customer.findFirst({
                where: { email: dto.email, id: { not: customerId }, deletedAt: null },
                select: { id: true },
            });
            if (emailTaken)
                throw new common_1.ConflictException(auth_constants_1.AUTH_ERROR.CUSTOMER_EMAIL_TAKEN);
        }
        const hashedPassword = await bcrypt.hash(dto.password, auth_constants_1.AUTH_CONFIG.BCRYPT_ROUNDS);
        const updated = await this.prisma.customer.update({
            where: { id: customerId },
            data: {
                isGuest: false,
                password: hashedPassword,
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.email && { email: dto.email, emailVerified: false }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                phoneVerified: true,
                email: true,
                emailVerified: true,
                isGuest: true,
                createdAt: true,
            },
        });
        this.logger.log(`Guest ${customerId} upgraded to full account`);
        return updated;
    }
    async deactivateAccount(customerId) {
        await this.getProfile(customerId);
        await this.prisma.customer.update({
            where: { id: customerId },
            data: { isActive: false },
        });
        await this.tokenService.revokeAllOwnerTokens('CUSTOMER', customerId, 'All_DEVICES');
        this.logger.log(`Customer ${customerId} deactivated their account`);
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = CustomerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => token_service_1.TokenService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map