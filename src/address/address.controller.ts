// src/address/address.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/decorators/user-type.decorator';
import type { RequestUser } from '../auth/auth.types';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { AddressService } from './address.service';

@ApiTags('Customer Addresses')
@ApiBearerAuth('access-token')
@UserType('CUSTOMER')
@Controller('customer/addresses')
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'List all my addresses' })
  async list(@CurrentUser() user: RequestUser) {
    const data = await this.service.list(user.id);
    return { message: 'Addresses retrieved', data };
  }

  @Post()
  @ApiOperation({ summary: 'Add a new address' })
  async create(
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.service.create(user.id, user.id, dto);
    return { message: 'Address added', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.service.update(id, user.id, user.id, dto);
    return { message: 'Address updated', data };
  }

  @Patch(':id/set-default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set as default address' })
  async setDefault(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.service.setDefault(id, user.id, user.id);
    return { message: 'Default address updated', data: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete address' })
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.service.delete(id, user.id, user.id);
    return { message: 'Address deleted', data: null };
  }

  // ─── Save address from order (called internally after order is placed) ───
  // This is a static utility — call it from your Order service:
  //   AddressController.saveGuestOrderAddress(prisma, customerId, shippingAddress)
  static async saveGuestOrderAddress(
    prisma: PrismaService,
    customerId: string,
    shippingAddress: {
      address: string;
      city: string;
      state: string;
      road?: string;
      zip: string;
      country: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<void> {
    // Don't duplicate if same address already exists
    const existing = await prisma.address.findFirst({
      where: {
        customerId,
        address: shippingAddress.address,
        city: shippingAddress.city,
        zip: shippingAddress.zip,
      },
    });

    if (existing) return;

    const hasAny = await prisma.address.count({ where: { customerId } });

    await prisma.address.create({
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
        isDefault: hasAny === 0, // first address becomes default
      },
    });
  }
}
