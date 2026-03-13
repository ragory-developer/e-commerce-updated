// ─── src/inventory/inventory.service.ts ───────────────────────

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, InventoryReason } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Check availability (no mutation) ────────────────────────
  async checkAvailability(
    productId: string,
    variantId: string | null,
    requestedQty: number,
  ): Promise<{
    available: boolean;
    currentQty: number | null;
    manageStock: boolean;
  }> {
    if (variantId) {
      const v = await this.prisma.productVariant.findFirst({
        where: { id: variantId, productId, deletedAt: null },
        select: { qty: true, inStock: true, manageStock: true },
      });
      if (!v) throw new NotFoundException('Variant not found');
      if (!v.inStock)
        return {
          available: false,
          currentQty: v.qty,
          manageStock: v.manageStock ?? false,
        };
      if (!v.manageStock)
        return { available: true, currentQty: v.qty, manageStock: false };
      return {
        available: (v.qty ?? 0) >= requestedQty,
        currentQty: v.qty,
        manageStock: true,
      };
    }

    const p = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { qty: true, inStock: true, manageStock: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    if (!p.inStock)
      return {
        available: false,
        currentQty: p.qty,
        manageStock: p.manageStock,
      };
    if (!p.manageStock)
      return { available: true, currentQty: p.qty, manageStock: false };
    return {
      available: (p.qty ?? 0) >= requestedQty,
      currentQty: p.qty,
      manageStock: true,
    };
  }

  // ── Deduct stock (inside transaction) ───────────────────────
  async deductStock(
    tx: Prisma.TransactionClient,
    productId: string,
    variantId: string | null,
    qty: number,
    reason: InventoryReason,
    orderId: string,
    createdBy: string,
  ): Promise<void> {
    const current = await this.getCurrentQtyTx(tx, productId, variantId);

    if (current.manageStock && (current.qty ?? 0) < qty) {
      throw new BadRequestException(
        `Insufficient stock for ${current.sku ?? variantId ?? productId}. Available: ${current.qty}`,
      );
    }

    const stockBefore = current.qty ?? 0;
    const stockAfter = stockBefore - qty;

    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { qty: stockAfter, inStock: stockAfter > 0 },
      });
    } else {
      await tx.product.update({
        where: { id: productId },
        data: { qty: stockAfter, inStock: stockAfter > 0 },
      });
    }

    await tx.inventoryLog.create({
      data: {
        productId,
        productVariantId: variantId,
        sku: current.sku,
        orderId,
        reason,
        quantity: -qty,
        stockBefore,
        stockAfter,
        createdBy,
      },
    });

    this.logger.log(
      `Stock deducted: ${variantId ?? productId} -${qty} (${reason}) [${stockBefore}→${stockAfter}]`,
    );
  }

  // ── Restore stock (inside transaction) ──────────────────────
  async restoreStock(
    tx: Prisma.TransactionClient,
    productId: string,
    variantId: string | null,
    qty: number,
    reason: InventoryReason,
    orderId: string,
    createdBy: string,
  ): Promise<void> {
    const current = await this.getCurrentQtyTx(tx, productId, variantId);
    const stockBefore = current.qty ?? 0;
    const stockAfter = stockBefore + qty;

    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { qty: stockAfter, inStock: true },
      });
    } else {
      await tx.product.update({
        where: { id: productId },
        data: { qty: stockAfter, inStock: true },
      });
    }

    await tx.inventoryLog.create({
      data: {
        productId,
        productVariantId: variantId,
        sku: current.sku,
        orderId,
        reason,
        quantity: qty,
        stockBefore,
        stockAfter,
        createdBy,
      },
    });
  }

  // ── Admin: manual stock adjustment ──────────────────────────
  async manualAdjust(
    productId: string,
    variantId: string | null,
    newQty: number,
    note: string,
    adminId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await this.getCurrentQtyTx(tx, productId, variantId);
      const stockBefore = current.qty ?? 0;

      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { qty: newQty, inStock: newQty > 0 },
        });
      } else {
        await tx.product.update({
          where: { id: productId },
          data: { qty: newQty, inStock: newQty > 0 },
        });
      }

      await tx.inventoryLog.create({
        data: {
          productId,
          productVariantId: variantId,
          sku: current.sku,
          reason: InventoryReason.MANUAL_ADJUSTMENT,
          quantity: newQty - stockBefore,
          stockBefore,
          stockAfter: newQty,
          createdBy: adminId,
          metadata: { note } as Prisma.InputJsonValue,
        },
      });
    });
  }

  // ── Get inventory logs ──────────────────────────────────────
  async getLogs(productId?: string, skip = 0, take = 50) {
    const where: Prisma.InventoryLogWhereInput = {
      ...(productId && { productId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.inventoryLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.inventoryLog.count({ where }),
    ]);

    return { data, total, meta: { skip, take } };
  }

  // ── Private: get current qty inside tx ──────────────────────
  private async getCurrentQtyTx(
    tx: Prisma.TransactionClient,
    productId: string,
    variantId: string | null,
  ) {
    if (variantId) {
      const v = await tx.productVariant.findFirst({
        where: { id: variantId },
        select: { qty: true, manageStock: true, sku: true },
      });
      return {
        qty: v?.qty ?? 0,
        manageStock: v?.manageStock ?? false,
        sku: v?.sku ?? null,
      };
    }
    const p = await tx.product.findFirst({
      where: { id: productId },
      select: { qty: true, manageStock: true, sku: true },
    });
    return {
      qty: p?.qty ?? 0,
      manageStock: p?.manageStock ?? false,
      sku: p?.sku ?? null,
    };
  }
}
