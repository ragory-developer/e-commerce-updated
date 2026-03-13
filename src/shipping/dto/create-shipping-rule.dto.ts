import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Must match Prisma enum
export enum ShippingRuleTypeDto {
  FLAT = 'FLAT',
  WEIGHT_BASED = 'WEIGHT_BASED',
  PRICE_BASED = 'PRICE_BASED',
}

export class CreateShippingRuleDto {
  @ApiProperty() @IsString() @IsNotEmpty() deliveryZoneId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() courierId!: string;

  @ApiPropertyOptional({ enum: ShippingRuleTypeDto, default: 'FLAT' })
  @IsOptional()
  @IsEnum(ShippingRuleTypeDto)
  ruleType?: ShippingRuleTypeDto;

  @ApiProperty({ example: 60 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseCost!: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  perKgCost?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freeShippingMinimum?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedMinDays?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedMaxDays?: number;
}
