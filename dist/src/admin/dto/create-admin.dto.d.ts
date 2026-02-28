import { AdminRole, AdminPermission } from '@prisma/client';
export declare class CreateAdminDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role?: AdminRole;
    permissions?: AdminPermission[];
}
