// ─── src/tax/dto/create-tax-class.dto.ts ──────────────────────

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxBasedOn } from '@prisma/client';

export class CreateTaxClassDto {
  @ApiProperty({ example: 'Standard Tax' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  name!: string;

  @ApiPropertyOptional({ enum: TaxBasedOn, default: 'SHIPPING_ADDRESS' })
  @IsOptional()
  @IsEnum(TaxBasedOn)
  basedOn?: TaxBasedOn;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: object;
}
