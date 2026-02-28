"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const otp_module_1 = require("../otp/otp.module");
const auth_controller_1 = require("./auth.controller");
const admin_auth_service_1 = require("./admin-auth.service");
const customer_auth_service_1 = require("./customer-auth.service");
const token_service_1 = require("./token.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const common_2 = require("@nestjs/common");
const admin_module_1 = require("../admin/admin.module");
const customer_module_1 = require("../customer/customer.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
            otp_module_1.OtpModule,
            (0, common_2.forwardRef)(() => admin_module_1.AdminModule),
            (0, common_2.forwardRef)(() => customer_module_1.CustomerModule),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow('jwt.secret'),
                    signOptions: { expiresIn: '15m' },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [admin_auth_service_1.AdminAuthService, customer_auth_service_1.CustomerAuthService, token_service_1.TokenService, jwt_strategy_1.JwtStrategy],
        exports: [
            token_service_1.TokenService,
            admin_auth_service_1.AdminAuthService,
            customer_auth_service_1.CustomerAuthService,
            jwt_strategy_1.JwtStrategy,
            passport_1.PassportModule,
            jwt_1.JwtModule,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map