// ─── THE CHECKOUT DTO ─────────────────────────────────────────
// Frontend sends: cart items + address info + coupon + courier selection
// Backend does everything else.

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CheckoutItemDto {
  @ApiProperty({ example: 'clx_product_001' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: 'clx_variant_001' })
  @IsOptional()
  @IsString()
  productVariantId?: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CheckoutAddressDto {
  @ApiProperty() @IsString() @IsNotEmpty() fullName!: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone!: string;
  @ApiProperty() @IsString() @IsNotEmpty() addressLine!: string;
  @ApiProperty() @IsString() @IsNotEmpty() divisionId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() cityId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() areaId!: string;

  @ApiPropertyOptional({
    description: 'Existing address ID to use instead of new',
  })
  @IsOptional()
  @IsString()
  addressId?: string;
}

export class CheckoutDto {
  // Cart items
  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  // Address (new or existing)
  @ApiProperty({ type: CheckoutAddressDto })
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  shippingAddress!: CheckoutAddressDto;

  // Courier selection
  @ApiProperty({ example: 'clx_courier_001' })
  @IsString()
  @IsNotEmpty()
  courierId!: string;

  // Payment
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // Coupon
  @ApiPropertyOptional({ example: 'SAVE20' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  // Customer note
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  // Save address to profile?
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;
}
