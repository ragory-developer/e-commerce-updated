// src/address/address.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async list(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(customerId: string, userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({
      where: { customerId },
    });

    const shouldBeDefault = dto.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await this.prisma.address.updateMany({
        where: { customerId, isDefault: true },
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

  async update(
    id: string,
    customerId: string,
    userId: string,
    dto: UpdateAddressDto,
  ) {
    const existing = await this.prisma.address.findFirst({
      where: { id, customerId },
    });

    if (!existing) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });
  }

  async setDefault(id: string, customerId: string, userId: string) {
    const existing = await this.prisma.address.findFirst({
      where: { id, customerId },
    });

    if (!existing) throw new NotFoundException('Address not found');

    await this.prisma.address.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });

    await this.prisma.address.update({
      where: { id },
      data: { isDefault: true, updatedBy: userId },
    });
  }

  async delete(id: string, customerId: string, userId: string) {
    const existing = await this.prisma.address.findFirst({
      where: { id, customerId },
    });

    if (!existing) throw new NotFoundException('Address not found');

    await this.prisma.softDelete('address', id, userId);

    if (existing.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { customerId },
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
}
