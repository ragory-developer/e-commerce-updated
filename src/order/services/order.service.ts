// ─── THE ORCHESTRATOR: checkout → order ───────────────────────
// This is the most important file. It coordinates everything.

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrderStatus,
  InventoryReason,
  Prisma,
  PaymentMethod,
} from '@prisma/client';
import { OrderValidatorService } from './order-validator.service';
import { OrderCalculatorService } from './order-calculator.service';
import { OrderQueryService } from './order-query.service';
import { InventoryService } from '../../inventory/inventory.service';
import { LocationService } from '../../location/location.service';
import { AddressService } from '../../address/address.service';
import { CheckoutDto, UpdateOrderStatusDto, CancelOrderItemDto } from '../dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: OrderValidatorService,
    private readonly calculator: OrderCalculatorService,
    private readonly queryService: OrderQueryService,
    private readonly inventoryService: InventoryService,
    private readonly locationService: LocationService,
    private readonly addressService: AddressService,
  ) {}

  // ══════════════════════════════════════════════════════════════
  //  CHECKOUT → CREATE ORDER
  // ══════════════════════════════════════════════════════════════
  async checkout(dto: CheckoutDto, customerId: string) {
    // Step 1: Validate all items → resolve prices from DB
    const resolvedLines = await this.validator.validateAndResolveItems(
      dto.items,
    );

    // Step 2: Resolve address → get delivery zone
    const area = await this.locationService.resolveArea(
      dto.shippingAddress.areaId,
    );
    const deliveryZoneId = area.deliveryZoneId;

    // Step 3: Calculate everything
    const calc = await this.calculator.calculate(
      resolvedLines,
      deliveryZoneId,
      dto.courierId,
      area.city.division.name, // state-level for tax
      area.city.name,
      dto.couponCode,
    );

    // Step 4: Build address snapshot
    const addressSnapshot = {
      fullName: dto.shippingAddress.fullName,
      phone: dto.shippingAddress.phone,
      addressLine: dto.shippingAddress.addressLine,
      division: area.city.division.name,
      city: area.city.name,
      area: area.name,
      postalCode: area.postalCode,
      country: 'BD',
    };

    // Step 5: Load customer info
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Step 6: ATOMIC TRANSACTION
    const order = await this.prisma.$transaction(async (tx) => {
      // 6a. Deduct inventory for every line item
      for (const line of resolvedLines) {
        await this.inventoryService.deductStock(
          tx,
          line.productId,
          line.productVariantId,
          line.qty,
          InventoryReason.ORDER_PLACED,
          '', // orderId set after creation
          customerId,
        );
      }

      // 6b. Create Order
      const order = await tx.order.create({
        data: {
          customerId,
          customerEmail: customer.email ?? '',
          customerPhone: customer.phone,
          customerFirstName: customer.firstName ?? dto.shippingAddress.fullName,
          customerLastName: customer.lastName ?? '',
          shippingAddress: addressSnapshot as unknown as Prisma.InputJsonValue,
          billingAddress: addressSnapshot as unknown as Prisma.InputJsonValue,
          deliveryZoneId,
          courierId: dto.courierId,
          deliveryZone: area.deliveryZone.name,
          courierName: calc.shippingRule?.courier?.name ?? null,
          subTotal: new Prisma.Decimal(calc.subTotal),
          shippingCost: new Prisma.Decimal(calc.shippingCost),
          discount: new Prisma.Decimal(calc.discount),
          taxTotal: new Prisma.Decimal(calc.taxTotal),
          total: new Prisma.Decimal(calc.total),
          paymentMethod: dto.paymentMethod,
          couponId: calc.coupon?.couponId ?? null,
          couponCode: calc.coupon?.code ?? null,
          couponDiscountType: (calc.coupon?.discountType as any) ?? null,
          couponDiscountValue: calc.coupon
            ? new Prisma.Decimal(calc.coupon.value)
            : null,
          status: OrderStatus.PENDING,
          notes: dto.note
            ? ({ customer: dto.note } as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          createdBy: customerId,
        },
      });

      // 6c. Create OrderProduct rows
      for (const line of resolvedLines) {
        await tx.orderProduct.create({
          data: {
            orderId: order.id,
            productId: line.productId,
            productVariantId: line.productVariantId,
            productName: line.productName,
            productSku: line.productSku,
            productSlug: line.productSlug,
            productImage: line.productImage
              ? (line.productImage as Prisma.InputJsonValue)
              : Prisma.JsonNull,
            unitPrice: new Prisma.Decimal(line.unitPrice),
            qty: line.qty,
            lineTotal: new Prisma.Decimal(line.lineTotal),
          },
        });
      }

      // 6d. Create OrderTax records
      for (const tax of calc.taxBreakdown) {
        await tx.orderTax.create({
          data: {
            orderId: order.id,
            taxRateId: tax.taxRateId,
            amount: new Prisma.Decimal(tax.amount),
            rateName: tax.rateName,
            rateValue: new Prisma.Decimal(tax.rateValue),
          },
        });
      }

      // 6e. Status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          metadata: {
            changedBy: customerId,
            reason: 'Order placed',
            paymentMethod: dto.paymentMethod,
          } as Prisma.InputJsonValue,
        },
      });

      // 6f. Increment coupon usage
      if (calc.coupon) {
        await tx.coupon.update({
          where: { id: calc.coupon.couponId },
          data: { used: { increment: 1 } },
        });
      }

      return order;
    });

    // Step 7: Save address to customer profile (async, non-blocking)
    if (dto.saveAddress !== false) {
      this.addressService
        .saveFromOrder(customerId, {
          address: dto.shippingAddress.addressLine,
          city: area.city.name,
          state: area.city.division.name,
          zip: area.postalCode,
          country: 'BD',
        })
        .catch((err) => {
          this.logger.warn(`Failed to save address from order: ${err.message}`);
        });
    }

    this.logger.log(
      `Order #${order.orderNumber} created. Total: ${calc.total} BDT`,
    );
    return this.queryService.findOne(order.id);
  }

  // ══════════════════════════════════════════════════════════════
  //  ADMIN: UPDATE STATUS
  // ══════════════════════════════════════════════════════════════
  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: dto.status,
          updatedBy: adminId,
          ...(dto.status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
          ...(dto.status === OrderStatus.DELIVERED && {
            deliveredAt: new Date(),
          }),
          ...(dto.status === OrderStatus.CANCELED && {
            canceledAt: new Date(),
          }),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: dto.status,
          metadata: {
            changedBy: adminId,
            changedByRole: 'ADMIN',
            reason: dto.reason ?? `Status changed to ${dto.status}`,
          } as Prisma.InputJsonValue,
        },
      });
    });

    return this.queryService.findOne(orderId);
  }

  // ══════════════════════════════════════════════════════════════
  //  CUSTOMER: CANCEL ORDER (until PROCESSING)
  // ══════════════════════════════════════════════════════════════
  async cancelOrder(orderId: string, customerId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId, deletedAt: null },
      include: { products: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (![OrderStatus.PENDING].includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be canceled in ${order.status} status`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.products) {
        await this.inventoryService.restoreStock(
          tx,
          item.productId,
          item.productVariantId,
          item.qty,
          InventoryReason.ORDER_CANCELED,
          order.id,
          customerId,
        );
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELED,
          canceledAt: new Date(),
          updatedBy: customerId,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELED,
          metadata: {
            changedBy: customerId,
            reason: reason ?? 'Customer canceled',
          } as Prisma.InputJsonValue,
        },
      });
    });

    return this.queryService.findOne(orderId);
  }

  // ══════════════════════════════════════════════════════════════
  //  CUSTOMER: CANCEL SINGLE ITEM (partial)
  // ══════════════════════════════════════════════════════════════
  async cancelOrderItem(
    orderId: string,
    dto: CancelOrderItemDto,
    customerId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId, deletedAt: null },
      include: { products: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel items in ${order.status} status`,
      );
    }

    const item = order.products.find((p) => p.id === dto.orderProductId);
    if (!item) throw new NotFoundException('Order item not found');

    await this.prisma.$transaction(async (tx) => {
      await this.inventoryService.restoreStock(
        tx,
        item.productId,
        item.productVariantId,
        item.qty,
        InventoryReason.ORDER_ITEM_CANCELED,
        order.id,
        customerId,
      );

      await tx.orderProduct.delete({ where: { id: item.id } });

      const remaining = await tx.orderProduct.findMany({ where: { orderId } });

      if (remaining.length === 0) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELED,
            canceledAt: new Date(),
            subTotal: 0,
            total: 0,
          },
        });
      } else {
        const newSub = remaining.reduce(
          (s, i) => s + i.lineTotal.toNumber(),
          0,
        );
        const newTotal =
          newSub +
          order.shippingCost.toNumber() -
          order.discount.toNumber() +
          order.taxTotal.toNumber();
        await tx.order.update({
          where: { id: orderId },
          data: {
            subTotal: new Prisma.Decimal(newSub),
            total: new Prisma.Decimal(Math.max(newTotal, 0)),
          },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus:
            remaining.length === 0 ? OrderStatus.CANCELED : order.status,
          metadata: {
            changedBy: customerId,
            reason: dto.reason ?? 'Item canceled',
            canceledItem: item.productName,
          } as Prisma.InputJsonValue,
        },
      });
    });

    return this.queryService.findOne(orderId);
  }
}
