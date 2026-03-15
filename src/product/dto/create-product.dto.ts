// ─── src/product/dto/create-product.dto.ts ────────────────────

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  Min,
  MaxLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { VariationType, SpecialPriceType } from '@prisma/client';

// ─── Nested DTOs ──────────────────────────────────────────────

export class ProductSeoDto {
  @ApiPropertyOptional({ example: 'custom-url-slug' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  url?: string;

  @ApiPropertyOptional({ example: 'Buy T-Shirt Online' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Best cotton t-shirt...' })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class ProductAttributeItemDto {
  @ApiProperty({ example: 'clx_attr_001' })
  @IsString()
  @IsNotEmpty()
  attributeId!: string;

  @ApiProperty({ example: ['clx_val_001', 'clx_val_002'] })
  @IsArray()
  @IsString({ each: true })
  attributeValueIds!: string[];
}

export class VariationValueItemDto {
  @ApiPropertyOptional({
    example: 'clx_val_001',
    description: 'Existing variation value ID',
  })
  @IsOptional()
  @IsString()
  variationValueId?: string;

  @ApiProperty({ example: 'XL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  label!: string;

  @ApiPropertyOptional({ example: '#ff0000' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  value?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class ProductVariationItemDto {
  @ApiPropertyOptional({
    example: 'clx_var_001',
    description: 'Existing global variation ID',
  })
  @IsOptional()
  @IsString()
  variationId?: string;

  @ApiProperty({ example: 'size' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({ enum: VariationType, example: 'TEXT' })
  @IsEnum(VariationType)
  type!: VariationType;

  @ApiProperty({ type: [VariationValueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationValueItemDto)
  values!: VariationValueItemDto[];
}

export class ProductVariantItemDto {
  @ApiProperty({ example: 'xl / red' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  name!: string;

  @ApiPropertyOptional({ example: 'TSHIRT-XL-RED' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  specialPrice?: number;

  @ApiPropertyOptional({ enum: SpecialPriceType, example: 'FIXED' })
  @IsOptional()
  @IsEnum(SpecialPriceType)
  specialPriceType?: SpecialPriceType;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  specialPriceStart?: string;

  @ApiPropertyOptional({ example: '2026-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  specialPriceEnd?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    example: ['clx_media_001', 'clx_media_002'],
    description: 'Media IDs for variant images',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}

// ─── Main DTO ─────────────────────────────────────────────────

export class CreateProductDto {
  // ─── General ──────────────────────────────────────────────
  @ApiProperty({ example: 'Classic T-Shirt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({ example: '<p>Premium cotton t-shirt</p>' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: 'Premium cotton t-shirt' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'clx_brand_001' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'clx_tax_001' })
  @IsOptional()
  @IsString()
  taxClassId?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // ─── Categories & Tags ────────────────────────────────────
  @ApiPropertyOptional({
    example: ['clx_cat_001', 'clx_cat_002'],
    description: 'Array of category IDs. First ID becomes the primary category.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    example: ['clx_tag_001'],
    description: 'Array of tag IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  // ─── Attributes ───────────────────────────────────────────
  @ApiPropertyOptional({ type: [ProductAttributeItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeItemDto)
  attributes?: ProductAttributeItemDto[];

  // ─── Variations ───────────────────────────────────────────
  @ApiPropertyOptional({ type: [ProductVariationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariationItemDto)
  variations?: ProductVariationItemDto[];

  // ─── Variants ─────────────────────────────────────────────
  @ApiPropertyOptional({ type: [ProductVariantItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantItemDto)
  variants?: ProductVariantItemDto[];

  // ─── Global Pricing (when NO variants) ────────────────────
  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 24.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  specialPrice?: number;

  @ApiPropertyOptional({ enum: SpecialPriceType, example: 'FIXED' })
  @IsOptional()
  @IsEnum(SpecialPriceType)
  specialPriceType?: SpecialPriceType;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  specialPriceStart?: string;

  @ApiPropertyOptional({ example: '2026-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  specialPriceEnd?: string;

  // ─── Global Inventory (when NO variants) ──────────────────
  @ApiPropertyOptional({ example: 'TSHIRT-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    example: 5,
    description: 'Alert threshold for low stock notifications',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  // ─── Shipping / Physical Dimensions ───────────────────────
  @ApiPropertyOptional({ example: 0.5, description: 'Weight in kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: '30', description: 'Length in cm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  length?: string;

  @ApiPropertyOptional({ example: '20', description: 'Width in cm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  width?: string;

  @ApiPropertyOptional({ example: '10', description: 'Height in cm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  height?: string;

  // ─── Media ────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: ['clx_media_001', 'clx_media_002'],
    description: 'Media IDs for product images (stored via EntityMedia)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({
    example: 'clx_media_001',
    description: 'Main/thumbnail media ID',
  })
  @IsOptional()
  @IsString()
  mainMediaId?: string;

  // ─── SEO ──────────────────────────────────────────────────
  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSeoDto)
  seo?: ProductSeoDto;

  // ─── i18n Translations ────────────────────────────────────
  @ApiPropertyOptional({
    type: Object,
    description: 'Translations JSON',
    example: { bn: { name: 'ক্লাসিক টি-শার্ট' } },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;

  // ─── Additional ───────────────────────────────────────────
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  newFrom?: string;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  newTo?: string;

  // ─── Linked Products ──────────────────────────────────────
  @ApiPropertyOptional({
    example: ['clx_prod_001'],
    description: 'Related product IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];

  @ApiPropertyOptional({
    example: ['clx_prod_002'],
    description: 'Up-sell product IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  upSellProductIds?: string[];

  @ApiPropertyOptional({
    example: ['clx_prod_003'],
    description: 'Cross-sell product IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crossSellProductIds?: string[];
}
