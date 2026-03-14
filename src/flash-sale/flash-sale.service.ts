// src/flash-sale/flash-sale.service.ts (COMPLETE REWRITE)

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, FlashSaleStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FlashSaleService {
  private readonly logger = new Logger(FlashSaleService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ══════════════════════════════════════════════════════════════
  // CRON: AUTO-UPDATE FLASH SALE STATUS
  // ══════════════════════════════════════════════════════════════
  @Cron(CronExpression.EVERY_MINUTE)
  async updateFlashSaleStatuses() {
    const now = new Date();

    // Start scheduled sales
    const started = await this.prisma.flashSale.updateMany({
      where: {
        status: FlashSaleStatus.SCHEDULED,
        startTime: { lte: now },
        endTime: { gt: now },
        deletedAt: null,
      },
      data: { status: FlashSaleStatus.ACTIVE },
    });

    if (started.count > 0) {
      this.logger.log(`Started ${started.count} flash sales`);
    }

    // End active sales
    const ended = await this.prisma.flashSale.updateMany({
      where: {
        status: FlashSaleStatus.ACTIVE,
        endTime: { lte: now },
        deletedAt: null,
      },
      data: { status: FlashSaleStatus.ENDED },
    });

    if (ended.count > 0) {
      this.logger.log(`Ended ${ended.count} flash sales`);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CREATE FLASH SALE
  // ══════════════════════════════════════════════════════════════
  async create(dto: any, createdBy: string): Promise<object> {
    // Validate timing
    const now = new Date();
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Determine initial status
    let status = FlashSaleStatus.SCHEDULED;
    if (startTime <= now && endTime > now) {
      status = FlashSaleStatus.ACTIVE;
    } else if (endTime <= now) {
      throw new BadRequestException(
        'Cannot create flash sale with past end time',
      );
    }

    // Verify all products exist and have sufficient stock
    const productIds = dto.products.map((p: any) => p.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        qty: true,
        inStock: true,
        variants: {
          where: { deletedAt: null },
          select: { id: true, qty: true, inStock: true },
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    // Validate stock availability
    for (const productDto of dto.products) {
      const product = products.find((p) => p.id === productDto.productId);

      if (productDto.productVariantId) {
        const variant = product?.variants.find(
          (v) => v.id === productDto.productVariantId,
        );
        if (!variant) {
          throw new NotFoundException(
            `Variant ${productDto.productVariantId} not found`,
          );
        }
        if (!variant.inStock || (variant.qty && variant.qty < productDto.qty)) {
          throw new BadRequestException(
            `Insufficient stock for variant ${productDto.productVariantId}. Available: ${variant.qty}, Requested: ${productDto.qty}`,
          );
        }
      } else {
        if (
          !product?.inStock ||
          (product.qty && product.qty < productDto.qty)
        ) {
          throw new BadRequestException(
            `Insufficient stock for product ${product?.name}. Available: ${product?.qty}, Requested: ${productDto.qty}`,
          );
        }
      }

      // Validate price
      if (productDto.price <= 0) {
        throw new BadRequestException(
          'Flash sale price must be greater than 0',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const flashSale = await tx.flashSale.create({
        data: {
          name: dto.name,
          description: dto.description,
          startTime,
          endTime,
          status,
          discountType: dto.discountType || 'FIXED',
          discountValue: dto.discountValue || 0,
          translations: dto.translations,
          isActive: true,
          createdBy,
        },
      });

      const flashSaleProducts = await Promise.all(
        dto.products.map((product: any, index: number) =>
          tx.flashSaleProduct.create({
            data: {
              flashSaleId: flashSale.id,
              productId: product.productId,
              productVariantId: product.productVariantId || null,
              price: product.price,
              qty: product.qty,
              sold: 0,
              reserved: 0,
              endDate: endTime,
              position: product.position ?? index,
              isActive: true,
              createdBy,
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  images: true,
                },
              },
            },
          }),
        ),
      );

      this.logger.log(
        `Flash sale created: ${flashSale.name} with ${flashSaleProducts.length} products (Status: ${status})`,
      );

      return {
        ...flashSale,
        products: flashSaleProducts,
      };
    });
  }

  // ══════════════════════════════════════════════════════════════
  // RESERVE FLASH SALE STOCK (Called during checkout)
  // ══════════════════════════════════════════════════════════════
  async reserveStock(
    flashSaleProductId: string,
    quantity: number,
    customerId: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.prisma.$transaction(async (tx) => {
      const flashSaleProduct = await tx.flashSaleProduct.findFirst({
        where: { id: flashSaleProductId, deletedAt: null },
        select: {
          id: true,
          qty: true,
          sold: true,
          reserved: true,
          isActive: true,
          endDate: true,
          flashSale: {
            select: { status: true },
          },
        },
      });

      if (!flashSaleProduct) {
        return { success: false, message: 'Flash sale product not found' };
      }

      // Check if flash sale is active
      if (flashSaleProduct.flashSale.status !== FlashSaleStatus.ACTIVE) {
        return { success: false, message: 'Flash sale is not active' };
      }

      // Check if flash sale has ended
      if (new Date() > flashSaleProduct.endDate) {
        return { success: false, message: 'Flash sale has ended' };
      }

      // Check availability (sold + reserved must not exceed qty)
      const available =
        flashSaleProduct.qty -
        flashSaleProduct.sold -
        flashSaleProduct.reserved;

      if (available < quantity) {
        return {
          success: false,
          message: `Only ${available} items available in flash sale`,
        };
      }

      // Reserve stock (atomic increment)
      await tx.flashSaleProduct.update({
        where: { id: flashSaleProductId },
        data: {
          reserved: { increment: quantity },
        },
      });

      this.logger.log(
        `Flash sale stock reserved: ${flashSaleProductId}, qty: ${quantity}, customer: ${customerId}`,
      );

      return { success: true };
    });
  }

  // ══════════════════════════════════════════════════════════════
  // RELEASE FLASH SALE STOCK (Called when checkout expires/fails)
  // ══════════════════════════════════════════════════════════════
  async releaseStock(
    flashSaleProductId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.flashSaleProduct.update({
      where: { id: flashSaleProductId },
      data: {
        reserved: { decrement: quantity },
      },
    });

    this.logger.log(
      `Flash sale stock released: ${flashSaleProductId}, qty: ${quantity}`,
    );
  }

  // ══════════════════════════════════════════════════════════════
  // CONFIRM FLASH SALE PURCHASE (Called when order is confirmed)
  // ══════════════════════════════════════════════════════════════
  async confirmPurchase(
    flashSaleProductId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Move from reserved to sold
      await tx.flashSaleProduct.update({
        where: { id: flashSaleProductId },
        data: {
          sold: { increment: quantity },
          reserved: { decrement: quantity },
        },
      });

      this.logger.log(
        `Flash sale purchase confirmed: ${flashSaleProductId}, qty: ${quantity}`,
      );
    });
  }

  // ══════════════════════════════════════════════════════════════
  // GET ACTIVE FLASH SALES (PUBLIC)
  // ══════════════════════════════════════════════════════════════
  async getActiveFlashSales(): Promise<any[]> {
    const now = new Date();

    return this.prisma.flashSale.findMany({
      where: {
        deletedAt: null,
        status: FlashSaleStatus.ACTIVE,
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now },
      },
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        discountType: true,
        discountValue: true,
        translations: true,
        products: {
          where: {
            deletedAt: null,
            isActive: true,
            endDate: { gt: now },
          },
          select: {
            id: true,
            productId: true,
            productVariantId: true,
            price: true,
            qty: true,
            sold: true,
            reserved: true,
            endDate: true,
            position: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                averageRating: true,
                reviewCount: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CHECK FLASH SALE AVAILABILITY (for product detail page)
  // ══════════════════════════════════════════════════════════════
  async checkFlashSaleForProduct(
    productId: string,
    variantId?: string,
  ): Promise<any | null> {
    const now = new Date();

    const flashSaleProduct = await this.prisma.flashSaleProduct.findFirst({
      where: {
        productId,
        ...(variantId && { productVariantId: variantId }),
        deletedAt: null,
        isActive: true,
        endDate: { gt: now },
        flashSale: {
          status: FlashSaleStatus.ACTIVE,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        price: true,
        qty: true,
        sold: true,
        reserved: true,
        endDate: true,
        flashSale: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    if (!flashSaleProduct) return null;

    const available =
      flashSaleProduct.qty - flashSaleProduct.sold - flashSaleProduct.reserved;

    return {
      ...flashSaleProduct,
      available,
      percentageSold: Math.round(
        (flashSaleProduct.sold / flashSaleProduct.qty) * 100,
      ),
    };
  }
}
