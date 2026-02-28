import { CustomerService } from './customer.service';
import type { RequestUser } from '../auth/auth.types';
import { UpdateCustomerProfileDto, ChangePasswordDto, UpgradeGuestDto } from './dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    getProfile(user: RequestUser): Promise<{
        message: string;
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            firstName: string | null;
            lastName: string | null;
            email: string | null;
            phone: string;
            avatar: string | null;
            lastLoginAt: Date | null;
            emailVerified: boolean;
            phoneVerified: boolean;
            isGuest: boolean;
        };
    }>;
    updateProfile(dto: UpdateCustomerProfileDto, user: RequestUser): Promise<{
        message: string;
        data: object;
    }>;
    changePassword(dto: ChangePasswordDto, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    upgradeGuest(dto: UpgradeGuestDto, user: RequestUser): Promise<{
        message: string;
        data: object;
    }>;
    deactivateAccount(user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
}
