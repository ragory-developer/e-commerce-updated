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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AddressService = class AddressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(customerId) {
        return this.prisma.address.findMany({
            where: { customerId, deletedAt: null },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id, customerId) {
        const address = await this.prisma.address.findFirst({
            where: { id, customerId, deletedAt: null },
        });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        return address;
    }
    async create(customerId, userId, dto) {
        const existingCount = await this.prisma.address.count({
            where: { customerId, deletedAt: null },
        });
        const shouldBeDefault = dto.isDefault || existingCount === 0;
        if (shouldBeDefault) {
            await this.prisma.address.updateMany({
                where: { customerId, isDefault: true, deletedAt: null },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.create({
            data: {
                customerId,
                label: dto.label ?? null,
                address: dto.address,
                descriptions: dto.descriptions,
                city: dto.city,
                state: dto.state,
                road: dto.road,
                zip: dto.zip,
                country: dto.country,
                isDefault: shouldBeDefault,
                createdBy: userId,
            },
        });
    }
    async update(id, customerId, userId, dto) {
        await this.findOne(id, customerId);
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: {
                    customerId,
                    isDefault: true,
                    id: { not: id },
                    deletedAt: null,
                },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.update({
            where: { id },
            data: { ...dto, updatedBy: userId },
        });
    }
    async setDefault(id, customerId, userId) {
        await this.findOne(id, customerId);
        await this.prisma.address.updateMany({
            where: { customerId, isDefault: true, deletedAt: null },
            data: { isDefault: false },
        });
        await this.prisma.address.update({
            where: { id },
            data: { isDefault: true, updatedBy: userId },
        });
    }
    async delete(id, customerId, userId) {
        const existing = await this.findOne(id, customerId);
        await this.prisma.softDelete('address', id, userId);
        if (existing.isDefault) {
            const next = await this.prisma.address.findFirst({
                where: { customerId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
            if (next) {
                await this.prisma.address.update({
                    where: { id: next.id },
                    data: { isDefault: true },
                });
            }
        }
    }
    async saveFromOrder(customerId, shippingAddress) {
        const existing = await this.prisma.address.findFirst({
            where: {
                customerId,
                address: shippingAddress.address,
                city: shippingAddress.city,
                zip: shippingAddress.zip,
                deletedAt: null,
            },
        });
        if (existing)
            return;
        const hasAny = await this.prisma.address.count({
            where: { customerId, deletedAt: null },
        });
        await this.prisma.address.create({
            data: {
                customerId,
                label: 'Order Address',
                address: shippingAddress.address,
                descriptions: '',
                city: shippingAddress.city,
                state: shippingAddress.state,
                road: shippingAddress.road ?? '',
                zip: shippingAddress.zip,
                country: shippingAddress.country,
                isDefault: hasAny === 0,
            },
        });
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map