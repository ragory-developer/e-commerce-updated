import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import { UpdateCustomerProfileDto, ChangePasswordDto, UpgradeGuestDto } from './dto';
export declare class CustomerService {
    private readonly prisma;
    private readonly tokenService;
    private readonly logger;
    constructor(prisma: PrismaService, tokenService: TokenService);
    getProfile(customerId: string): Promise<{
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
    }>;
    updateProfile(customerId: string, dto: UpdateCustomerProfileDto): Promise<object>;
    changePassword(customerId: string, dto: ChangePasswordDto): Promise<void>;
    upgradeGuest(customerId: string, dto: UpgradeGuestDto): Promise<object>;
    deactivateAccount(customerId: string): Promise<void>;
}
