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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_constants_1 = require("../auth.constants");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    configService;
    prisma;
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('jwt.secret'),
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        const { sub, type, deviceId, role, permissions } = payload;
        const device = await this.prisma.device.findFirst({
            where: {
                id: deviceId,
                isActive: true,
            },
            select: { id: true },
        });
        if (!device) {
            throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.TOKEN_REVOKED);
        }
        if (type === 'ADMIN') {
            const admin = await this.prisma.admin.findFirst({
                where: { id: sub, isActive: true, deletedAt: null },
                select: { id: true },
            });
            if (!admin) {
                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
            }
        }
        else {
            const customer = await this.prisma.customer.findFirst({
                where: { id: sub, isActive: true, deletedAt: null },
                select: { id: true },
            });
            if (!customer) {
                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERROR.ACCOUNT_DISABLED);
            }
        }
        this.prisma.device
            .update({
            where: { id: deviceId },
            data: { lastActiveAt: new Date() },
        })
            .catch(() => {
        });
        return {
            id: sub,
            type,
            deviceId,
            role,
            permissions,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map