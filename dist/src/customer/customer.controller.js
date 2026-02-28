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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customer_service_1 = require("./customer.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_type_decorator_1 = require("../common/decorators/user-type.decorator");
const dto_1 = require("./dto");
let CustomerController = class CustomerController {
    customerService;
    constructor(customerService) {
        this.customerService = customerService;
    }
    async getProfile(user) {
        const data = await this.customerService.getProfile(user.id);
        return { message: 'Profile retrieved', data };
    }
    async updateProfile(dto, user) {
        const data = await this.customerService.updateProfile(user.id, dto);
        return { message: 'Profile updated', data };
    }
    async changePassword(dto, user) {
        await this.customerService.changePassword(user.id, dto);
        return {
            message: 'Password changed successfully. Please login again.',
            data: null,
        };
    }
    async upgradeGuest(dto, user) {
        const data = await this.customerService.upgradeGuest(user.id, dto);
        return { message: 'Account upgraded successfully', data };
    }
    async deactivateAccount(user) {
        await this.customerService.deactivateAccount(user.id);
        return { message: 'Account deactivated', data: null };
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my profile (name, email, avatar)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateCustomerProfileDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Change my password (must provide current password)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('upgrade-to-account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Upgrade guest account to full account',
        description: 'Requires phone to be verified first (POST /auth/customer/verify-phone/request). ' +
            'Sets a password and optionally name/email. Same customer ID — all orders preserved.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpgradeGuestDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "upgradeGuest", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate my account (soft — all sessions revoked)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deactivateAccount", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('Customer — Profile'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, user_type_decorator_1.UserType)('CUSTOMER'),
    (0, common_1.Controller)('customer'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map