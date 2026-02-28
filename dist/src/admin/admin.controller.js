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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const admin_service_1 = require("./admin.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_type_decorator_1 = require("../common/decorators/user-type.decorator");
const dto_1 = require("./dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class ResetPasswordBodyDto {
    newPassword;
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'TempP@ss123', minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], ResetPasswordBodyDto.prototype, "newPassword", void 0);
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getOwnProfile(user) {
        const data = await this.adminService.getProfile(user.id);
        return { message: 'Profile retrieved', data };
    }
    async updateOwnProfile(dto, user) {
        const data = await this.adminService.updateProfile(user.id, dto);
        return { message: 'Profile updated', data };
    }
    async changeOwnPassword(dto, user) {
        await this.adminService.changePassword(user.id, dto);
        return { message: 'Password changed. Please login again.', data: null };
    }
    async createAdmin(dto, user) {
        const data = await this.adminService.createAdmin(dto, user.role, user.id);
        return { message: 'Admin created successfully', data };
    }
    async listAdmins(user) {
        const data = await this.adminService.listAdmins(user.role);
        return { message: 'Admins retrieved', data };
    }
    async getAdmin(id, user) {
        const data = await this.adminService.getAdmin(id, user.role);
        return { message: 'Admin retrieved', data };
    }
    async updatePermissions(id, dto, user) {
        const data = await this.adminService.updatePermissions(id, dto, user.role);
        return { message: 'Permissions updated', data };
    }
    async updateRole(id, dto, user) {
        await this.adminService.updateRole(id, dto, user.role);
        return { message: 'Role updated', data: null };
    }
    async enableAdmin(id, user) {
        await this.adminService.enableAdmin(id, user.role, user.id);
        return { message: 'Admin enabled', data: null };
    }
    async disableAdmin(id, user) {
        await this.adminService.disableAdmin(id, user.role, user.id);
        return { message: 'Admin disabled', data: null };
    }
    async unlockAdmin(id, user) {
        await this.adminService.unlockAdmin(id, user.role);
        return { message: 'Admin account unlocked', data: null };
    }
    async resetAdminPassword(id, body, user) {
        await this.adminService.resetAdminPassword(id, body.newPassword, user.role);
        return { message: 'Admin password reset successfully', data: null };
    }
    async deleteAdmin(id, user) {
        await this.adminService.deleteAdmin(id, user.role, user.id);
        return { message: 'Admin deleted', data: null };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get own admin profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOwnProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update own profile (name, phone, avatar)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateAdminProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOwnProfile", null);
__decorate([
    (0, common_1.Post)('profile/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change own password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdminChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeOwnPassword", null);
__decorate([
    (0, common_1.Post)('manage'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[SUPERADMIN] Create a new admin account' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('manage'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[SUPERADMIN] List all admins' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listAdmins", null);
__decorate([
    (0, common_1.Get)('manage/:id'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({ summary: '[SUPERADMIN] Get a specific admin' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdmin", null);
__decorate([
    (0, common_1.Patch)('manage/:id/permissions'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({
        summary: '[SUPERADMIN] Update admin permissions (add / remove / set)',
        description: 'Use `add` to grant permissions, `remove` to revoke, or `set` to replace all at once.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAdminPermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Patch)('manage/:id/role'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({ summary: '[SUPERADMIN] Change admin role (ADMIN / MANAGER)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAdminRoleDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)('manage/:id/enable'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({ summary: '[SUPERADMIN] Enable a disabled admin account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "enableAdmin", null);
__decorate([
    (0, common_1.Patch)('manage/:id/disable'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({
        summary: '[SUPERADMIN] Disable admin account + revoke all sessions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "disableAdmin", null);
__decorate([
    (0, common_1.Patch)('manage/:id/unlock'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({
        summary: '[SUPERADMIN] Unlock admin account (reset failed login attempts)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unlockAdmin", null);
__decorate([
    (0, common_1.Patch)('manage/:id/reset-password'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({
        summary: '[SUPERADMIN] Force-reset admin password + revoke all sessions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResetPasswordBodyDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resetAdminPassword", null);
__decorate([
    (0, common_1.Delete)('manage/:id'),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, swagger_1.ApiOperation)({
        summary: '[SUPERADMIN] Soft-delete admin account + revoke all sessions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAdmin", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin — Management'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, user_type_decorator_1.UserType)('ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map