import { AuthUserType } from '@prisma/client';
export declare const USER_TYPE_KEY = "userType";
export declare const UserType: (...types: AuthUserType[]) => import("@nestjs/common").CustomDecorator<string>;
