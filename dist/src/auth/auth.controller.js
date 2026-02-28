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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_service_1 = require("./admin-auth.service");
const customer_auth_service_1 = require("./customer-auth.service");
const token_service_1 = require("./token.service");
const admin_service_1 = require("../admin/admin.service");
const customer_service_1 = require("../customer/customer.service");
const dto_1 = require("./dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
function extractDeviceInfo(req, body) {
    return {
        clientDeviceId: body.deviceId ?? generateFallbackDeviceId(req),
        deviceName: body.deviceName,
        deviceType: body.deviceType,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
            req.socket.remoteAddress ??
            undefined,
        userAgent: req.headers['user-agent'] ?? undefined,
    };
}
function generateFallbackDeviceId(req) {
    const ua = req.headers['user-agent'] ?? '';
    const ip = req.socket.remoteAddress ?? '';
    const raw = `${ua}:${ip}`;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = (hash << 5) + hash + raw.charCodeAt(i);
        hash &= 0xffffffff;
    }
    return `fallback-${Math.abs(hash).toString(16)}`;
}
let AuthController = class AuthController {
    adminAuthService;
    customerAuthService;
    tokenService;
    adminService;
    customerService;
    prisma;
    constructor(adminAuthService, customerAuthService, tokenService, adminService, customerService, prisma) {
        this.adminAuthService = adminAuthService;
        this.customerAuthService = customerAuthService;
        this.tokenService = tokenService;
        this.adminService = adminService;
        this.customerService = customerService;
        this.prisma = prisma;
    }
    async adminLogin(dto, req) {
        const deviceInfo = extractDeviceInfo(req, dto);
        const result = await this.adminAuthService.AdminLogin(dto, deviceInfo);
        return {
            message: 'Login successful',
            data: {
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        };
    }
    async requestRegistrationOtp(dto, req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
            req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.customerAuthService.requestRegistrationOtp(dto, ip, ua);
        return {
            message: `OTP sent to ${result.maskedPhone}`,
            data: result,
        };
    }
    async verifyRegistrationOtp(dto) {
        const result = await this.customerAuthService.verifyRegistrationOtp(dto.phone, dto.code);
        return {
            message: 'OTP verified. Use registrationToken to complete registration.',
            data: result,
        };
    }
    async completeRegistration(dto, req) {
        const deviceInfo = extractDeviceInfo(req, dto);
        const result = await this.customerAuthService.completeRegistration(dto, deviceInfo);
        return {
            message: 'Registration successful',
            data: {
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        };
    }
    async customerPasswordLogin(dto, req) {
        const deviceInfo = extractDeviceInfo(req, dto);
        const result = await this.customerAuthService.loginWithPassword(dto, deviceInfo);
        return {
            message: 'Login successful',
            data: {
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        };
    }
    async requestLoginOtp(dto, req) {
        const ip = req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.customerAuthService.requestLoginOtp(dto, ip, ua);
        return {
            message: `OTP sent to ${result.maskedPhone}`,
            data: result,
        };
    }
    async customerOtpLogin(dto, req) {
        const deviceInfo = extractDeviceInfo(req, dto);
        const result = await this.customerAuthService.loginWithOtp(dto, deviceInfo);
        return {
            message: 'Login successful',
            data: {
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        };
    }
    async requestPhoneVerification(dto, req) {
        const ip = req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.customerAuthService.requestPhoneVerification(dto, ip, ua);
        return {
            message: `Verification OTP sent to ${result.maskedPhone}`,
            data: result,
        };
    }
    async confirmPhoneVerification(dto) {
        await this.customerAuthService.confirmPhoneVerification(dto);
        return { message: 'Phone verified successfully', data: null };
    }
    async forgotPassword(dto, req) {
        const ip = req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.customerAuthService.requestPasswordReset(dto, ip, ua);
        return {
            message: `Reset OTP sent to ${result.maskedPhone}`,
            data: result,
        };
    }
    async resetPassword(dto) {
        await this.customerAuthService.resetPassword(dto);
        return { message: 'Password reset successfully', data: null };
    }
    async refresh(dto) {
        const { tokens } = await this.tokenService.rotateRefreshToken(dto.refreshToken, dto.deviceId);
        return {
            message: 'Token refreshed',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
            },
        };
    }
    async logout(dto, user) {
        await this.tokenService.revokeToken(dto.refreshToken);
        await this.tokenService.revokeDeviceTokens(user.deviceId, 'LOGOUT');
        return { message: 'Logged out successfully', data: null };
    }
    async logoutAll(user) {
        await this.tokenService.revokeAllOwnerTokens(user.type, user.id, 'All_DEVICES');
        return { message: 'Logged out from all devices', data: null };
    }
    async getMe(user) {
        if (user.type === 'ADMIN') {
            const profile = await this.adminService.getProfile(user.id);
            return {
                message: 'Profile retrieved',
                data: { ...profile, userType: 'ADMIN' },
            };
        }
        else {
            const profile = await this.customerService.getProfile(user.id);
            return {
                message: 'Profile retrieved',
                data: { ...profile, userType: 'CUSTOMER' },
            };
        }
    }
    async getDevices(user) {
        const ownerWhere = user.type === 'ADMIN' ? { adminId: user.id } : { customerId: user.id };
        const devices = await this.prisma.device.findMany({
            where: { ...ownerWhere, isActive: true },
            select: {
                id: true,
                deviceId: true,
                deviceName: true,
                deviceType: true,
                ipAddress: true,
                lastActiveAt: true,
                createdAt: true,
            },
            orderBy: { lastActiveAt: 'desc' },
        });
        return { message: 'Devices retrieved', data: devices };
    }
    async revokeDevice(deviceDbId, user) {
        const ownerWhere = user.type === 'ADMIN' ? { adminId: user.id } : { customerId: user.id };
        const device = await this.prisma.device.findFirst({
            where: { id: deviceDbId, ...ownerWhere },
        });
        if (!device)
            return { message: 'Device not found', data: null };
        await this.tokenService.revokeDeviceTokens(deviceDbId, 'DEVICE_LOGOUT');
        return { message: 'Device logged out', data: null };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Admin login with email + password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdminLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/register/request-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Step 1] Send OTP to phone for registration' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerRequestOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestRegistrationOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/register/verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '[Step 2] Verify OTP → returns registrationToken (15 min)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerVerifyRegistrationOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyRegistrationOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/register/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '[Step 3] Complete registration with registrationToken + profile',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerCompleteRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeRegistration", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/login/password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Customer login with phone + password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerPasswordLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerPasswordLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/login/otp/request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Step 1] Request OTP for OTP-based login' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerOtpLoginRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestLoginOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/login/otp/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Step 2] Verify OTP and login' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerOtpLoginVerifyDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerOtpLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/verify-phone/request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request phone verification OTP (for guests)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyPhoneRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPhoneVerification", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/verify-phone/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm phone verification OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyPhoneConfirmDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmPhoneVerification", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/password/forgot'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset OTP' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ForgotPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customer/password/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate refresh token → new token pair' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from current device' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LogoutDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'List all active devices for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDevices", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Delete)('devices/:deviceDbId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout a specific device by its DB ID' }),
    __param(0, (0, common_1.Param)('deviceDbId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeDevice", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService,
        customer_auth_service_1.CustomerAuthService,
        token_service_1.TokenService,
        admin_service_1.AdminService,
        customer_service_1.CustomerService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map