import { AdminRole, AdminPermission } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import { CreateAdminDto, UpdateAdminPermissionsDto, UpdateAdminRoleDto, UpdateAdminProfileDto, AdminChangePasswordDto } from './dto';
export declare class AdminService {
    private readonly prisma;
    private readonly tokenService;
    private readonly logger;
    constructor(prisma: PrismaService, tokenService: TokenService);
    createAdmin(dto: CreateAdminDto, callerRole: AdminRole, createdBy: string): Promise<object>;
    listAdmins(callerRole: AdminRole): Promise<{
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
    }[]>;
    getAdmin(targetId: string, callerRole: AdminRole): Promise<{
        id: string;
        isActive: boolean;
        role: import("@prisma/client").$Enums.AdminRole;
        permissions: import("@prisma/client").$Enums.AdminPermission[];
    }>;
    updatePermissions(targetId: string, dto: UpdateAdminPermissionsDto, callerRole: AdminRole): Promise<{
        permissions: AdminPermission[];
    }>;
    updateRole(targetId: string, dto: UpdateAdminRoleDto, callerRole: AdminRole): Promise<void>;
    enableAdmin(targetId: string, callerRole: AdminRole, callerId: string): Promise<void>;
    disableAdmin(targetId: string, callerRole: AdminRole, callerId: string): Promise<void>;
    unlockAdmin(targetId: string, callerRole: AdminRole): Promise<void>;
    resetAdminPassword(targetId: string, newPassword: string, callerRole: AdminRole): Promise<void>;
    deleteAdmin(targetId: string, callerRole: AdminRole, callerId: string): Promise<void>;
    getProfile(adminId: string): Promise<{
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
    }>;
    updateProfile(adminId: string, dto: UpdateAdminProfileDto): Promise<object>;
    changePassword(adminId: string, dto: AdminChangePasswordDto): Promise<void>;
    private requireSuperAdmin;
    private preventSelfModify;
    private preventModifySuperAdmin;
    private findActiveAdminOrFail;
}
