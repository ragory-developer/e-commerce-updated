// ─── Validates all checkout inputs ────────────────────────────

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CheckoutItemDto } from '../dto';
import { ResolvedLine } from '../types/resolved-line.type';

@Injectable()
export class OrderValidatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async validateAndResolveItems(
    items: CheckoutItemDto[],
  ): Promise<ResolvedLine[]> {
    if (!items.length)
      throw new BadRequestException('Order must have at least one item');

    const resolved: ResolvedLine[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          specialPrice: true,
          specialPriceType: true,
          specialPriceStart: true,
          specialPriceEnd: true,
          images: true,
          manageStock: true,
          qty: true,
          inStock: true,
          taxClassId: true,
        },
      });

      if (!product)
        throw new NotFoundException(
          `Product ${item.productId} not found or inactive`,
        );

      let unitPrice: number;
      let productName = product.name;
      let productSku = product.sku;
      let manageStock = product.manageStock;
      let currentStockQty = product.qty;

      if (item.productVariantId) {
        const variant = await this.prisma.productVariant.findFirst({
          where: {
            id: item.productVariantId,
            productId: item.productId,
            isActive: true,
            deletedAt: null,
          },
        });
        if (!variant)
          throw new NotFoundException(
            `Variant ${item.productVariantId} not found`,
          );

        unitPrice = this.effectivePrice(
          variant.price?.toNumber(),
          variant.specialPrice?.toNumber(),
          variant.specialPriceType,
          variant.specialPriceStart,
          variant.specialPriceEnd,
        );
        productName = `${product.name} / ${variant.name}`;
        productSku = variant.sku;
        manageStock = variant.manageStock ?? false;
        currentStockQty = variant.qty;
      } else {
        unitPrice = this.effectivePrice(
          product.price?.toNumber(),
          product.specialPrice?.toNumber(),
          product.specialPriceType,
          product.specialPriceStart,
          product.specialPriceEnd,
        );
      }

      // Validate stock
      const stock = await this.inventoryService.checkAvailability(
        item.productId,
        item.productVariantId ?? null,
        item.quantity,
      );
      if (!stock.available) {
        throw new BadRequestException(
          `Insufficient stock for "${productName}". Available: ${stock.currentQty ?? 0}`,
        );
      }

      const images = product.images as any[];
      const thumbnail =
        images?.find?.((i: any) => i.isThumbnail) ?? images?.[0] ?? null;

      resolved.push({
        productId: item.productId,
        productVariantId: item.productVariantId ?? null,
        taxClassId: product.taxClassId,
        productName,
        productSku,
        productSlug: product.slug,
        productImage: thumbnail,
        unitPrice,
        qty: item.quantity,
        lineTotal: parseFloat((unitPrice * item.quantity).toFixed(4)),
        manageStock,
        currentStockQty,
      });
    }

    return resolved;
  }

  private effectivePrice(
    base?: number | null,
    special?: number | null,
    type?: string | null,
    start?: Date | null,
    end?: Date | null,
  ): number {
    const price = base ?? 0;
    if (!special || !type) return price;
    const now = new Date();
    if (start && now < start) return price;
    if (end && now > end) return price;
    if (type === 'FIXED') return special;
    if (type === 'PERCENT')
      return parseFloat((price - (price * special) / 100).toFixed(4));
    return price;
  }
}
