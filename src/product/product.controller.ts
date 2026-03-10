import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
  BulkEditVariantDto,
} from './dto';
import { ProductVariantDto } from './dto/create-product.dto';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { UserType } from '../common/decorators/user-type.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { RequestUser } from '../auth/auth.types';
import { AdminPermission } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ══════════════════════════════════════════════════════════════
  // CREATE PRODUCT
  // ══════════════════════════════════════════════════════════════
  @Post()
  @ApiBearerAuth('access-token')
  @UserType('ADMIN')
  @Permissions(AdminPermission.MANAGE_PRODUCTS)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Single payload creates the product with categories, tags, attributes, variations, variants, and linked products in one transaction.',
  })
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: RequestUser) {
    const data = await this.productService.create(dto, user.id);
    return { message: 'Product created successfully', data };
  }

  // ══════════════════════════════════════════════════════════════
  // SEARCH PRODUCTS (for linked product selects)
  // ══════════════════════════════════════════════════════════════
  @Get('search')
  @Public()
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiOperation({
    summary: 'Search products for select dropdowns (related, up-sell, cross-sell)',
    description: 'Returns id, name, slug, images, price for matching active products',
  })
  async search(@Query('q') q: string) {
    const data = await this.productService.search(q ?? '');
    return { message: 'Products retrieved successfully', data };
  }

  // ══════════════════════════════════════════════════════════════
  // LIST PRODUCTS (PUBLIC)
  // ══════════════════════════════════════════════════════════════
  @Get()
  @Public()
  @ApiOperation({ summary: 'List all products with pagination and filters' })
  async findAll(@Query() dto: ListProductsDto) {
    const result = await this.productService.findAll(dto);
    return {
      message: 'Products retrieved successfully',
      data: result.data,
      meta: result.meta,
      total: result.total,
    };
  }

  // ══════════════════════════════════════════════════════════════
  // GET PRODUCT BY ID (PUBLIC)
  // ══════════════════════════════════════════════════════════════
  @Get(':id')
  @Public()
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOperation({ summary: 'Get product by ID with all relations' })
  async findOne(@Param('id') id: string) {
    const data = await this.productService.findOne(id);
    return { message: 'Product retrieved successfully', data };
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE PRODUCT
  // ══════════════════════════════════════════════════════════════
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UserType('ADMIN')
  @Permissions(AdminPermission.MANAGE_PRODUCTS)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOperation({ summary: 'Update product (syncs categories, tags, attributes, variants)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.productService.update(id, dto, user.id);
    return { message: 'Product updated successfully', data };
  }

  // ══════════════════════════════════════════════════════════════
  // DELETE PRODUCT
  // ══════════════════════════════════════════════════════════════
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UserType('ADMIN')
  @Permissions(AdminPermission.MANAGE_PRODUCTS)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOperation({ summary: 'Soft delete a product (also soft-deletes all variants)' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.productService.remove(id, user.id);
    return { message: 'Product deleted successfully', data: null };
  }

  // ══════════════════════════════════════════════════════════════
  // BULK EDIT VARIANTS
  // ══════════════════════════════════════════════════════════════
  @Patch(':id/variants/bulk')
  @ApiBearerAuth('access-token')
  @UserType('ADMIN')
  @Permissions(AdminPermission.MANAGE_PRODUCTS)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOperation({
    summary: 'Bulk update a field on all variants of a product',
    description: "e.g., set price=30 for all variants. Allowed fields: price, specialPrice, specialPriceType, manageStock, inStock, qty",
  })
  async bulkEditVariants(
    @Param('id') id: string,
    @Body() dto: BulkEditVariantDto,
  ) {
    const data = await this.productService.bulkEditVariants(id, dto);
    return { message: 'Variants updated successfully', data };
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE SINGLE VARIANT
  // ══════════════════════════════════════════════════════════════
  @Patch(':id/variants/:variantId')
  @ApiBearerAuth('access-token')
  @UserType('ADMIN')
  @Permissions(AdminPermission.MANAGE_PRODUCTS)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiOperation({ summary: 'Update a single product variant' })
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: ProductVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.productService.updateVariant(id, variantId, dto, user.id);
    return { message: 'Variant updated successfully', data };
  }
}
