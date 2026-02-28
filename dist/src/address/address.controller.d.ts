import type { RequestUser } from '../auth/auth.types';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { AddressService } from './address.service';
export declare class AddressController {
    private readonly service;
    constructor(service: AddressService);
    list(user: RequestUser): Promise<{
        message: string;
        data: {
            address: string;
            id: string;
            deletedAt: Date | null;
            deletedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            customerId: string;
            label: string | null;
            descriptions: string;
            city: string;
            state: string;
            road: string;
            zip: string;
            country: string;
            isDefault: boolean;
            updatedBy: string | null;
        }[];
    }>;
    findOne(id: string, user: RequestUser): Promise<{
        message: string;
        data: {
            address: string;
            id: string;
            deletedAt: Date | null;
            deletedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            customerId: string;
            label: string | null;
            descriptions: string;
            city: string;
            state: string;
            road: string;
            zip: string;
            country: string;
            isDefault: boolean;
            updatedBy: string | null;
        };
    }>;
    create(dto: CreateAddressDto, user: RequestUser): Promise<{
        message: string;
        data: {
            address: string;
            id: string;
            deletedAt: Date | null;
            deletedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            customerId: string;
            label: string | null;
            descriptions: string;
            city: string;
            state: string;
            road: string;
            zip: string;
            country: string;
            isDefault: boolean;
            updatedBy: string | null;
        };
    }>;
    update(id: string, dto: UpdateAddressDto, user: RequestUser): Promise<{
        message: string;
        data: {
            address: string;
            id: string;
            deletedAt: Date | null;
            deletedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            customerId: string;
            label: string | null;
            descriptions: string;
            city: string;
            state: string;
            road: string;
            zip: string;
            country: string;
            isDefault: boolean;
            updatedBy: string | null;
        };
    }>;
    setDefault(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
    delete(id: string, user: RequestUser): Promise<{
        message: string;
        data: null;
    }>;
}
