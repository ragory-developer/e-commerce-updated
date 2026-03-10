// ─── src/product/dto/list-products.dto.ts ─────────────────────

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ListProductsDto {
  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;

  @ApiPropertyOptional({ example: 't-shirt', description: 'Search by name/sku' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'clx_brand_001' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'clx_cat_001' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
