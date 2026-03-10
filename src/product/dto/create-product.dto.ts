import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  MaxLength,
  Min,
  IsInt,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SpecialPriceType, VariationType } from '@prisma/client';

// ─── Nested: SEO ────────────────────────────────────────────────
export class ProductSeoDto {
  @ApiPropertyOptional({ example: '/products/my-product' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'My Product - Best Quality' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Buy the best quality product...' })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

// ─── Nested: Product Attribute ──────────────────────────────────
export class ProductAttributeDto {
  @ApiProperty({ example: 'clx_attr_123', description: 'Attribute ID' })
  @IsString()
  @IsNotEmpty()
  attributeId!: string;

  @ApiProperty({
    example: ['clx_attrval_1', 'clx_attrval_2'],
    description: 'Array of attribute value IDs',
  })
  @IsArray()
  @IsString({ each: true })
  attributeValueIds!: string[];
}

// ─── Nested: Variation Value (inline) ───────────────────────────
export class InlineVariationValueDto {
  @ApiProperty({ example: 'Small', description: 'Label for the variation value' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  label!: string;

  @ApiPropertyOptional({ example: '#FF0000', description: 'Value (hex color, image URL, etc.)' })
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

// ─── Nested: Product Variation ──────────────────────────────────
export class ProductVariationDto {
  @ApiPropertyOptional({
    example: 'clx_variation_123',
    description: 'Existing variation ID. If provided, links the product to this variation.',
  })
  @IsOptional()
  @IsString()
  variationId?: string;

  @ApiPropertyOptional({
    example: 'Size',
    description: 'Name when creating a new variation inline',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    enum: VariationType,
    example: VariationType.TEXT,
    description: 'Type when creating a new variation inline',
  })
  @IsOptional()
  @IsEnum(VariationType)
  type?: VariationType;

  @ApiPropertyOptional({
    type: [InlineVariationValueDto],
    description: 'Values to create/use for this variation on the product',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineVariationValueDto)
  values?: InlineVariationValueDto[];
}

// ─── Nested: Product Variant ────────────────────────────────────
export class ProductVariantDto {
  @ApiProperty({ example: 'S - Red', description: 'Variant name (e.g., combination label)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiPropertyOptional({ example: 'TSHIRT-S-RED', description: 'SKU for this variant' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 29.99, description: 'Variant price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 24.99, description: 'Special/sale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  specialPrice?: number;

  @ApiPropertyOptional({ enum: SpecialPriceType, example: SpecialPriceType.FIXED })
  @IsOptional()
  @IsEnum(SpecialPriceType)
  specialPriceType?: SpecialPriceType;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  specialPriceStart?: string;

  @ApiPropertyOptional({ example: '2026-01-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  specialPriceEnd?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether to track inventory for this variant' })
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether variant is in stock' })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is this the default variant?' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Is this variant active?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Display order position' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Variant images JSON (array of image objects)',
    example: [{ url: 'https://cdn.example.com/shirt-red.jpg', alt: 'Red Shirt', position: 0 }],
  })
  @IsOptional()
  images?: any;
}

// ─── Main DTO ────────────────────────────────────────────────────
export class CreateProductDto {
  // ─── General ──────────────────────────────────────────────────
  @ApiProperty({ example: 'Classic Cotton T-Shirt', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({
    example: 'A premium quality cotton t-shirt available in multiple sizes and colors.',
    description: 'Full product description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    example: 'Premium cotton t-shirt.',
    description: 'Short description for listings',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'clx_brand_123', description: 'Brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'clx_tax_123', description: 'Tax class ID' })
  @IsOptional()
  @IsString()
  taxClassId?: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Whether product is active/published' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ─── Global Pricing (only when NO variants) ───────────────────
  @ApiPropertyOptional({ example: 29.99, description: 'Base price (use when no variants)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 24.99, description: 'Special/sale price (use when no variants)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  specialPrice?: number;

  @ApiPropertyOptional({ enum: SpecialPriceType, description: 'Special price type' })
  @IsOptional()
  @IsEnum(SpecialPriceType)
  specialPriceType?: SpecialPriceType;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Special price start date' })
  @IsOptional()
  @IsDateString()
  specialPriceStart?: string;

  @ApiPropertyOptional({ example: '2026-01-31T23:59:59.000Z', description: 'Special price end date' })
  @IsOptional()
  @IsDateString()
  specialPriceEnd?: string;

  // ─── Global Inventory (only when NO variants) ─────────────────
  @ApiPropertyOptional({ example: 'TSHIRT-001', description: 'SKU (use when no variants)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether to track inventory' })
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Stock quantity (use when no variants)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether product is in stock' })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  // ─── Global Media (only when NO variants) ─────────────────────
  @ApiPropertyOptional({
    type: 'array',
    description: 'Product images JSON (use when no variants)',
    example: [{ url: 'https://cdn.example.com/shirt.jpg', alt: 'T-Shirt', position: 0, isThumbnail: true }],
  })
  @IsOptional()
  images?: any;

  // ─── Categories & Tags ────────────────────────────────────────
  @ApiPropertyOptional({ type: [String], example: ['clx_cat_1', 'clx_cat_2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['clx_tag_1', 'clx_tag_2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  // ─── Attributes ───────────────────────────────────────────────
  @ApiPropertyOptional({
    type: [ProductAttributeDto],
    description: 'Product attributes with their selected values',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  // ─── Variations ───────────────────────────────────────────────
  @ApiPropertyOptional({
    type: [ProductVariationDto],
    description: 'Variations linked to this product (existing or inline new)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariationDto)
  variations?: ProductVariationDto[];

  // ─── Variants ─────────────────────────────────────────────────
  @ApiPropertyOptional({
    type: [ProductVariantDto],
    description: 'Generated variant combinations',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  // ─── SEO ──────────────────────────────────────────────────────
  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSeoDto)
  seo?: ProductSeoDto;

  // ─── Scheduling ───────────────────────────────────────────────
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: '"New" badge start date' })
  @IsOptional()
  @IsDateString()
  newFrom?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z', description: '"New" badge end date' })
  @IsOptional()
  @IsDateString()
  newTo?: string;

  // ─── Linked Products ──────────────────────────────────────────
  @ApiPropertyOptional({
    type: [String],
    description: 'Related product IDs',
    example: ['clx_prod_1', 'clx_prod_2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Up-sell product IDs',
    example: ['clx_prod_3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  upSellProductIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Cross-sell product IDs',
    example: ['clx_prod_4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crossSellProductIds?: string[];

  // ─── Extra ────────────────────────────────────────────────────
  @ApiPropertyOptional({
    type: Object,
    description: 'Translations in different languages',
    example: { bn: { name: 'কটন টি-শার্ট' } },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;
}
