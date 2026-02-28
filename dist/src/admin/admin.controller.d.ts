import { AdminService } from './admin.service';
import type { RequestUser } from '../auth/auth.types';
import { CreateAdminDto, UpdateAdminPermissionsDto, UpdateAdminRoleDto, UpdateAdminProfileDto, AdminChangePasswordDto } from './dto';
declare class ResetPasswordBodyDto {
    newPassword: string;
}
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOwnProfile(user: RequestUser): Promise<{
        message: string;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import("@prisma/client").$Enums.AdminRole;
            permissions: import("@prisma/client").$Enums.AdminPermission[];
            lastLoginAt: Date | null;
        };
    }>;
    updateOwnProfile(dto: UpdateAdminProfileDto, user: RequestUser): Promise<{
        message: string;
        data: object;
    }>;
    changeOwnPassword(dto: AdminChangePasswordDto, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    createAdmin(dto: CreateAdminDto, user: RequestUser): Promise<{
        message: string;
        data: object;
    }>;
    listAdmins(user: RequestUser): Promise<{
        message: string;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import("@prisma/client").$Enums.AdminRole;
            permissions: import("@prisma/client").$Enums.AdminPermission[];
            loginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            updatedAt: Date;
        }[];
    }>;
    getAdmin(id: string, user: RequestUser): Promise<{
        message: string;
        data: {
            id: string;
            isActive: boolean;
            role: import("@prisma/client").$Enums.AdminRole;
            permissions: import("@prisma/client").$Enums.AdminPermission[];
        };
    }>;
    updatePermissions(id: string, dto: UpdateAdminPermissionsDto, user: RequestUser): Promise<{
        message: string;
        data: {
            permissions: import("@prisma/client").AdminPermission[];
        };
    }>;
    updateRole(id: string, dto: UpdateAdminRoleDto, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    enableAdmin(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    disableAdmin(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    unlockAdmin(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    resetAdminPassword(id: string, body: ResetPasswordBodyDto, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    deleteAdmin(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
}
export {};
