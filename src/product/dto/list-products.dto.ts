// ─── src/product/dto/list-products.dto.ts ─────────────────────

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ListProductsDto {
  // ─── Pagination ─────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 0,
    default: 0,
    description: 'Number of records to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of records to return (max 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;

  // ─── Search ─────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'bluetooth speaker',
    description: 'Search by product name or SKU',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // ─── Relation Filters ───────────────────────────────────────
  @ApiPropertyOptional({
    example: 'cmmkak0pi0006pd2amdwqn43f',
    description: 'Filter by brand ID',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    example: 'cmmr8sk0g0019pg2ajssdsv7r',
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'cmmlsk6uw0007nw2adwfn8dx8',
    description: 'Filter by tag ID',
  })
  @IsOptional()
  @IsString()
  tagId?: string;

  // ─── Status Filters ─────────────────────────────────────────
  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active/inactive status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter featured products only',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter in-stock products only',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStock?: boolean;

  // ─── Price Range ────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum price (inclusive)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum price (inclusive)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  // ─── Response Mode ──────────────────────────────────────────
  @ApiPropertyOptional({
    example: false,
    default: false,
    description:
      'Return full product detail (same shape as GET /products/:id). ' +
      'Default false returns a lightweight summary.',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  detail: boolean = false;

  // ─── Sorting ────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'newest',
    default: 'newest',
    description: 'Sort order',
    enum: [
      'newest',
      'oldest',
      'price_asc',
      'price_desc',
      'name_asc',
      'name_desc',
      'rating',
      'popular',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'newest',
    'oldest',
    'price_asc',
    'price_desc',
    'name_asc',
    'name_desc',
    'rating',
    'popular',
  ])
  sortBy?: string;
}
