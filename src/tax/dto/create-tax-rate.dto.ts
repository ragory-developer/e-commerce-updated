// ─── src/tax/dto/create-tax-rate.dto.ts ───────────────────────

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTaxRateDto {
  @ApiProperty({ example: 'clx_taxclass_001' })
  @IsString()
  @IsNotEmpty()
  taxClassId!: string;

  @ApiProperty({ example: 'VAT 15%' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  name!: string;

  @ApiProperty({
    example: 'BD',
    description: 'ISO 3166-1 alpha-2 country code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  country!: string;

  @ApiPropertyOptional({ example: '*', default: '*' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  state?: string;

  @ApiPropertyOptional({ example: '*', default: '*' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  city?: string;

  @ApiPropertyOptional({ example: '*', default: '*' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zip?: string;

  @ApiProperty({
    example: 15.0,
    description: 'Tax rate percentage e.g. 15 = 15%',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: object;
}
