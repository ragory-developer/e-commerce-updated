import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
  BulkEditVariantDto,
} from './dto';
import { ProductVariantDto } from './dto/create-product.dto';

// ─── Slugify helper ─────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ALLOWED_BULK_FIELDS = new Set([
  'price',
  'specialPrice',
  'specialPriceType',
  'manageStock',
  'inStock',
  'qty',
]);

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Generate unique product slug ──────────────────────────────
  private async generateSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name);
    const where: Prisma.ProductWhereInput = { slug: base, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    const existing = await this.prisma.product.findFirst({ where, select: { id: true } });
    if (!existing) return base;

    let suffix = 1;
    while (true) {
      const candidate = `${base}-${suffix}`;
      const w: Prisma.ProductWhereInput = { slug: candidate, deletedAt: null };
      if (excludeId) w.id = { not: excludeId };
      const found = await this.prisma.product.findFirst({ where: w, select: { id: true } });
      if (!found) return candidate;
      suffix++;
    }
  }

  // ─── Generate unique variation uid ─────────────────────────────
  private async generateVariationUid(name: string): Promise<string> {
    const base = slugify(name);
    const existing = await this.prisma.variation.findFirst({
      where: { uid: base, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return base;

    let suffix = 1;
    while (true) {
      const candidate = `${base}-${suffix}`;
      const found = await this.prisma.variation.findFirst({
        where: { uid: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!found) return candidate;
      suffix++;
    }
  }

  private async generateVariationValueUid(variationUid: string, label: string): Promise<string> {
    const base = `${variationUid}-${slugify(label)}`;
    const existing = await this.prisma.variationValue.findFirst({
      where: { uid: base, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return base;

    let suffix = 1;
    while (true) {
      const candidate = `${base}-${suffix}`;
      const found = await this.prisma.variationValue.findFirst({
        where: { uid: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!found) return candidate;
      suffix++;
    }
  }

  private async generateVariantUid(productSlug: string, variantName: string): Promise<string> {
    const base = `${productSlug}-${slugify(variantName)}`;
    const existing = await this.prisma.productVariant.findFirst({
      where: { uid: base, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return base;

    let suffix = 1;
    while (true) {
      const candidate = `${base}-${suffix}`;
      const found = await this.prisma.productVariant.findFirst({
        where: { uid: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!found) return candidate;
      suffix++;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CREATE PRODUCT (transactional)
  // ══════════════════════════════════════════════════════════════
  async create(dto: CreateProductDto, createdBy: string): Promise<object> {
    const slug = await this.generateSlug(dto.name);
    const hasVariants = !!(dto.variants && dto.variants.length > 0);

    const product = await this.prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          shortDescription: dto.shortDescription ?? null,
          brandId: dto.brandId ?? null,
          taxClassId: dto.taxClassId ?? null,
          isActive: dto.isActive ?? true,
          // Pricing/inventory only when no variants
          price: !hasVariants && dto.price != null ? dto.price : null,
          specialPrice: !hasVariants && dto.specialPrice != null ? dto.specialPrice : null,
          specialPriceType: !hasVariants && dto.specialPriceType != null ? dto.specialPriceType : null,
          specialPriceStart: !hasVariants && dto.specialPriceStart != null ? new Date(dto.specialPriceStart) : null,
          specialPriceEnd: !hasVariants && dto.specialPriceEnd != null ? new Date(dto.specialPriceEnd) : null,
          sku: !hasVariants && dto.sku != null ? dto.sku : null,
          manageStock: !hasVariants ? (dto.manageStock ?? false) : false,
          qty: !hasVariants && dto.qty != null ? dto.qty : null,
          inStock: !hasVariants ? (dto.inStock ?? true) : true,
          images: !hasVariants && dto.images != null ? (dto.images as Prisma.InputJsonValue) : Prisma.JsonNull,
          seo: dto.seo != null ? (dto.seo as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          newFrom: dto.newFrom != null ? new Date(dto.newFrom) : null,
          newTo: dto.newTo != null ? new Date(dto.newTo) : null,
          translations: dto.translations != null ? (dto.translations as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      // 2. Link categories
      if (dto.categoryIds && dto.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
          skipDuplicates: true,
        });
      }

      // 3. Link tags
      if (dto.tagIds && dto.tagIds.length > 0) {
        await tx.productTag.createMany({
          data: dto.tagIds.map((tagId) => ({ productId: product.id, tagId })),
          skipDuplicates: true,
        });
      }

      // 4. Link attributes + values
      if (dto.attributes && dto.attributes.length > 0) {
        for (const attrDto of dto.attributes) {
          const productAttribute = await tx.productAttribute.create({
            data: { productId: product.id, attributeId: attrDto.attributeId },
          });
          if (attrDto.attributeValueIds && attrDto.attributeValueIds.length > 0) {
            await tx.productAttributeValue.createMany({
              data: attrDto.attributeValueIds.map((attributeValueId) => ({
                productAttributeId: productAttribute.id,
                attributeValueId,
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      // 5. Handle variations
      if (dto.variations && dto.variations.length > 0) {
        for (const varDto of dto.variations) {
          let variationId = varDto.variationId;

          if (!variationId) {
            // Create new variation inline
            if (!varDto.name || !varDto.type) {
              throw new BadRequestException(
                'Inline variation requires name and type when variationId is not provided',
              );
            }
            const uid = await this.generateVariationUid(varDto.name);
            const newVariation = await tx.variation.create({
              data: {
                uid,
                name: varDto.name,
                type: varDto.type,
                isGlobal: false,
                createdBy,
              },
            });
            variationId = newVariation.id;

            // Create inline values
            if (varDto.values && varDto.values.length > 0) {
              for (const val of varDto.values) {
                const valueUid = await this.generateVariationValueUid(uid, val.label);
                await tx.variationValue.create({
                  data: {
                    uid: valueUid,
                    variationId: newVariation.id,
                    label: val.label,
                    value: val.value ?? null,
                    position: val.position ?? 0,
                    createdBy,
                  },
                });
              }
            }
          }

          // Link product to variation
          await tx.productVariation.create({
            data: { productId: product.id, variationId },
          });
        }
      }

      // 6. Create variants
      if (hasVariants && dto.variants) {
        for (const variantDto of dto.variants) {
          const uid = await this.generateVariantUid(slug, variantDto.name);
          await tx.productVariant.create({
            data: {
              uid,
              uids: slugify(variantDto.name),
              productId: product.id,
              name: variantDto.name,
              sku: variantDto.sku ?? null,
              price: variantDto.price != null ? variantDto.price : null,
              specialPrice: variantDto.specialPrice != null ? variantDto.specialPrice : null,
              specialPriceType: variantDto.specialPriceType ?? null,
              specialPriceStart: variantDto.specialPriceStart != null ? new Date(variantDto.specialPriceStart) : null,
              specialPriceEnd: variantDto.specialPriceEnd != null ? new Date(variantDto.specialPriceEnd) : null,
              manageStock: variantDto.manageStock ?? null,
              qty: variantDto.qty ?? null,
              inStock: variantDto.inStock ?? null,
              isDefault: variantDto.isDefault ?? false,
              isActive: variantDto.isActive ?? true,
              position: variantDto.position ?? 0,
              images: variantDto.images != null ? (variantDto.images as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
          });
        }
      }

      // 7. Link related products
      if (dto.relatedProductIds && dto.relatedProductIds.length > 0) {
        await tx.relatedProduct.createMany({
          data: dto.relatedProductIds.map((relatedProductId, index) => ({
            productId: product.id,
            relatedProductId,
            position: index,
          })),
          skipDuplicates: true,
        });
      }

      // 8. Link up-sell products
      if (dto.upSellProductIds && dto.upSellProductIds.length > 0) {
        await tx.upSellProduct.createMany({
          data: dto.upSellProductIds.map((upSellProductId, index) => ({
            productId: product.id,
            upSellProductId,
            position: index,
          })),
          skipDuplicates: true,
        });
      }

      // 9. Link cross-sell products
      if (dto.crossSellProductIds && dto.crossSellProductIds.length > 0) {
        await tx.crossSellProduct.createMany({
          data: dto.crossSellProductIds.map((crossSellProductId, index) => ({
            productId: product.id,
            crossSellProductId,
            position: index,
          })),
          skipDuplicates: true,
        });
      }

      return product;
    });

    this.logger.log(`Product created: ${product.slug} by ${createdBy}`);
    return this.findOne(product.id);
  }

  // ══════════════════════════════════════════════════════════════
  // FIND ALL
  // ══════════════════════════════════════════════════════════════
  async findAll(dto: ListProductsDto): Promise<{ data: object[]; total: number; meta: object }> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(dto.search && {
        OR: [
          { name: { contains: dto.search, mode: 'insensitive' } },
          { slug: { contains: dto.search, mode: 'insensitive' } },
        ],
      }),
      ...(dto.brandId && { brandId: dto.brandId }),
      ...(dto.categoryId && {
        categories: { some: { categoryId: dto.categoryId } },
      }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          specialPrice: true,
          specialPriceType: true,
          isActive: true,
          inStock: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          brand: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: {
              categories: true,
              variants: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: dto.skip,
        take: dto.take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      meta: {
        skip: dto.skip,
        take: dto.take,
        page: Math.floor(dto.skip / dto.take) + 1,
        pageCount: Math.ceil(total / dto.take),
      },
    };
  }

  // ══════════════════════════════════════════════════════════════
  // FIND ONE (full)
  // ══════════════════════════════════════════════════════════════
  async findOne(id: string): Promise<object> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        sku: true,
        price: true,
        specialPrice: true,
        specialPriceType: true,
        specialPriceStart: true,
        specialPriceEnd: true,
        manageStock: true,
        qty: true,
        inStock: true,
        weight: true,
        dimensions: true,
        isActive: true,
        viewed: true,
        newFrom: true,
        newTo: true,
        images: true,
        downloads: true,
        translations: true,
        seo: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: { id: true, name: true, slug: true, image: true },
        },
        taxClass: {
          select: { id: true, name: true },
        },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        tags: {
          select: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
        attributes: {
          select: {
            id: true,
            attribute: { select: { id: true, name: true, slug: true, type: true } },
            value: {
              select: {
                attributeValue: { select: { id: true, value: true } },
              },
            },
          },
        },
        variations: {
          select: {
            variation: {
              select: {
                id: true,
                uid: true,
                name: true,
                type: true,
                values: {
                  where: { deletedAt: null },
                  select: {
                    id: true,
                    uid: true,
                    label: true,
                    value: true,
                    position: true,
                  },
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        variants: {
          where: { deletedAt: null },
          select: {
            id: true,
            uid: true,
            uids: true,
            name: true,
            sku: true,
            price: true,
            specialPrice: true,
            specialPriceType: true,
            specialPriceStart: true,
            specialPriceEnd: true,
            manageStock: true,
            qty: true,
            inStock: true,
            isDefault: true,
            isActive: true,
            position: true,
            images: true,
          },
          orderBy: { position: 'asc' },
        },
        relatedTo: {
          select: {
            relatedProduct: { select: { id: true, name: true, slug: true, images: true } },
            position: true,
          },
          orderBy: { position: 'asc' },
        },
        upSellTo: {
          select: {
            upSellProduct: { select: { id: true, name: true, slug: true, images: true } },
            position: true,
          },
          orderBy: { position: 'asc' },
        },
        crossSellTo: {
          select: {
            crossSellProduct: { select: { id: true, name: true, slug: true, images: true } },
            position: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE PRODUCT
  // ══════════════════════════════════════════════════════════════
  async update(id: string, dto: UpdateProductDto, updatedBy: string): Promise<object> {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, name: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const hasVariants = !!(dto.variants && dto.variants.length > 0);

      // Update product base fields
      await tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
          ...(dto.brandId !== undefined && { brandId: dto.brandId }),
          ...(dto.taxClassId !== undefined && { taxClassId: dto.taxClassId }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.specialPrice !== undefined && { specialPrice: dto.specialPrice }),
          ...(dto.specialPriceType !== undefined && { specialPriceType: dto.specialPriceType }),
          ...(dto.specialPriceStart !== undefined && { specialPriceStart: dto.specialPriceStart ? new Date(dto.specialPriceStart) : null }),
          ...(dto.specialPriceEnd !== undefined && { specialPriceEnd: dto.specialPriceEnd ? new Date(dto.specialPriceEnd) : null }),
          ...(dto.sku !== undefined && { sku: dto.sku }),
          ...(dto.manageStock !== undefined && { manageStock: dto.manageStock }),
          ...(dto.qty !== undefined && { qty: dto.qty }),
          ...(dto.inStock !== undefined && { inStock: dto.inStock }),
          ...(dto.images !== undefined && { images: dto.images ? (dto.images as Prisma.InputJsonValue) : Prisma.JsonNull }),
          ...(dto.seo !== undefined && { seo: dto.seo ? (dto.seo as unknown as Prisma.InputJsonValue) : Prisma.JsonNull }),
          ...(dto.newFrom !== undefined && { newFrom: dto.newFrom ? new Date(dto.newFrom) : null }),
          ...(dto.newTo !== undefined && { newTo: dto.newTo ? new Date(dto.newTo) : null }),
          ...(dto.translations !== undefined && { translations: dto.translations ? (dto.translations as Prisma.InputJsonValue) : Prisma.JsonNull }),
        },
      });

      // Sync categories
      if (dto.categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (dto.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: dto.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
            skipDuplicates: true,
          });
        }
      }

      // Sync tags
      if (dto.tagIds !== undefined) {
        await tx.productTag.deleteMany({ where: { productId: id } });
        if (dto.tagIds.length > 0) {
          await tx.productTag.createMany({
            data: dto.tagIds.map((tagId) => ({ productId: id, tagId })),
            skipDuplicates: true,
          });
        }
      }

      // Sync attributes
      if (dto.attributes !== undefined) {
        // Delete old attributes and values
        const oldAttrs = await tx.productAttribute.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const oldAttrIds = oldAttrs.map((a) => a.id);
        if (oldAttrIds.length > 0) {
          await tx.productAttributeValue.deleteMany({
            where: { productAttributeId: { in: oldAttrIds } },
          });
          await tx.productAttribute.deleteMany({ where: { productId: id } });
        }
        for (const attrDto of dto.attributes) {
          const productAttribute = await tx.productAttribute.create({
            data: { productId: id, attributeId: attrDto.attributeId },
          });
          if (attrDto.attributeValueIds && attrDto.attributeValueIds.length > 0) {
            await tx.productAttributeValue.createMany({
              data: attrDto.attributeValueIds.map((attributeValueId) => ({
                productAttributeId: productAttribute.id,
                attributeValueId,
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      // Sync related products
      if (dto.relatedProductIds !== undefined) {
        await tx.relatedProduct.deleteMany({ where: { productId: id } });
        if (dto.relatedProductIds.length > 0) {
          await tx.relatedProduct.createMany({
            data: dto.relatedProductIds.map((relatedProductId, index) => ({
              productId: id,
              relatedProductId,
              position: index,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Sync up-sell products
      if (dto.upSellProductIds !== undefined) {
        await tx.upSellProduct.deleteMany({ where: { productId: id } });
        if (dto.upSellProductIds.length > 0) {
          await tx.upSellProduct.createMany({
            data: dto.upSellProductIds.map((upSellProductId, index) => ({
              productId: id,
              upSellProductId,
              position: index,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Sync cross-sell products
      if (dto.crossSellProductIds !== undefined) {
        await tx.crossSellProduct.deleteMany({ where: { productId: id } });
        if (dto.crossSellProductIds.length > 0) {
          await tx.crossSellProduct.createMany({
            data: dto.crossSellProductIds.map((crossSellProductId, index) => ({
              productId: id,
              crossSellProductId,
              position: index,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Sync variants
      if (hasVariants && dto.variants) {
        // Soft-delete existing variants
        await tx.productVariant.updateMany({
          where: { productId: id, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        const productSlug = dto.name ? slugify(dto.name) : existing.slug;
        for (const variantDto of dto.variants) {
          const uid = await this.generateVariantUid(productSlug, variantDto.name);
          await tx.productVariant.create({
            data: {
              uid,
              uids: slugify(variantDto.name),
              productId: id,
              name: variantDto.name,
              sku: variantDto.sku ?? null,
              price: variantDto.price != null ? variantDto.price : null,
              specialPrice: variantDto.specialPrice != null ? variantDto.specialPrice : null,
              specialPriceType: variantDto.specialPriceType ?? null,
              specialPriceStart: variantDto.specialPriceStart != null ? new Date(variantDto.specialPriceStart) : null,
              specialPriceEnd: variantDto.specialPriceEnd != null ? new Date(variantDto.specialPriceEnd) : null,
              manageStock: variantDto.manageStock ?? null,
              qty: variantDto.qty ?? null,
              inStock: variantDto.inStock ?? null,
              isDefault: variantDto.isDefault ?? false,
              isActive: variantDto.isActive ?? true,
              position: variantDto.position ?? 0,
              images: variantDto.images != null ? (variantDto.images as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
          });
        }
      }
    });

    this.logger.log(`Product updated: ${existing.slug} by ${updatedBy}`);
    return this.findOne(id);
  }

  // ══════════════════════════════════════════════════════════════
  // REMOVE (SOFT DELETE)
  // ══════════════════════════════════════════════════════════════
  async remove(id: string, deletedBy: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Cascade soft-delete variants
    await this.prisma.productVariant.updateMany({
      where: { productId: id, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy },
    });

    await this.prisma.softDelete('product', id, deletedBy);
    this.logger.log(`Product deleted: ${product.slug} by ${deletedBy}`);
  }

  // ══════════════════════════════════════════════════════════════
  // SEARCH (for linked product selects)
  // ══════════════════════════════════════════════════════════════
  async search(query: string): Promise<object[]> {
    if (!query || query.trim().length < 1) return [];

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BULK EDIT VARIANTS
  // ══════════════════════════════════════════════════════════════
  async bulkEditVariants(productId: string, dto: BulkEditVariantDto): Promise<object> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!ALLOWED_BULK_FIELDS.has(dto.field)) {
      throw new BadRequestException(
        `Invalid field. Allowed fields: ${Array.from(ALLOWED_BULK_FIELDS).join(', ')}`,
      );
    }

    const result = await this.prisma.productVariant.updateMany({
      where: { productId, deletedAt: null },
      data: { [dto.field]: dto.value },
    });

    this.logger.log(`Bulk updated ${result.count} variants for product ${productId}: ${dto.field}=${dto.value}`);
    return { updated: result.count };
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE SINGLE VARIANT
  // ══════════════════════════════════════════════════════════════
  async updateVariant(
    productId: string,
    variantId: string,
    dto: ProductVariantDto,
    updatedBy: string,
  ): Promise<object> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.specialPrice !== undefined && { specialPrice: dto.specialPrice }),
        ...(dto.specialPriceType !== undefined && { specialPriceType: dto.specialPriceType }),
        ...(dto.specialPriceStart !== undefined && { specialPriceStart: dto.specialPriceStart ? new Date(dto.specialPriceStart) : null }),
        ...(dto.specialPriceEnd !== undefined && { specialPriceEnd: dto.specialPriceEnd ? new Date(dto.specialPriceEnd) : null }),
        ...(dto.manageStock !== undefined && { manageStock: dto.manageStock }),
        ...(dto.qty !== undefined && { qty: dto.qty }),
        ...(dto.inStock !== undefined && { inStock: dto.inStock }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.images !== undefined && { images: dto.images ? (dto.images as Prisma.InputJsonValue) : Prisma.JsonNull }),
      },
    });

    this.logger.log(`Variant updated: ${variant.uid} by ${updatedBy}`);
    return updated;
  }
}
