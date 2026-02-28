import { AdminPermission } from '@prisma/client';
export declare class UpdateAdminPermissionsDto {
    add?: AdminPermission[];
    remove?: AdminPermission[];
    set?: AdminPermission[];
}
