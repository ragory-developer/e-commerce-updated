// ─── Calculates subtotal, tax, discount, shipping, total ──────

import { Injectable } from '@nestjs/common';
import { TaxService, TaxLineInput, AddressForTax } from '../../tax/tax.service';
import { CouponService } from '../../coupon/coupon.service';
import { ShippingService } from '../../shipping/shipping.service';
import { ResolvedLine } from '../types/resolved-line.type';

export interface OrderCalculation {
  subTotal: number;
  shippingCost: number;
  discount: number;
  taxTotal: number;
  total: number;
  taxBreakdown: Array<{
    taxRateId: string;
    rateName: string;
    rateValue: number;
    amount: number;
  }>;
  coupon: {
    couponId: string;
    code: string;
    discountType: string;
    value: number;
  } | null;
  shippingRule: any;
}

@Injectable()
export class OrderCalculatorService {
  constructor(
    private readonly taxService: TaxService,
    private readonly couponService: CouponService,
    private readonly shippingService: ShippingService,
  ) {}

  async calculate(
    lines: ResolvedLine[],
    deliveryZoneId: string,
    courierId: string,
    shippingCountry: string,
    shippingState: string,
    couponCode?: string,
  ): Promise<OrderCalculation> {
    // 1. Subtotal
    const subTotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    // 2. Shipping
    const shipping = await this.shippingService.calculateShipping(
      deliveryZoneId,
      courierId,
      subTotal,
    );

    // 3. Coupon
    let discount = 0;
    let couponSnapshot: OrderCalculation['coupon'] = null;

    if (couponCode) {
      const result = await this.couponService.validateCoupon({
        code: couponCode,
        orderTotal: subTotal,
        productIds: lines.map((l) => l.productId),
      });
      if (result.valid && result.discount) {
        discount = result.discount;
        if (result.freeShipping) shipping.cost = 0;

        const coupon = (await this.couponService.findByCode(couponCode)) as any;
        couponSnapshot = {
          couponId: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          value: Number(coupon.value),
        };
      }
    }
    discount = Math.min(discount, subTotal);

    // 4. Tax
    const taxableAmount = subTotal - discount;
    const taxLines: TaxLineInput[] = lines
      .filter((l) => l.taxClassId)
      .map((l) => ({
        productId: l.productId,
        taxClassId: l.taxClassId,
        lineTotal: subTotal > 0 ? (l.lineTotal / subTotal) * taxableAmount : 0,
      }));

    const taxAddress: AddressForTax = {
      country: shippingCountry,
      state: shippingState,
    };
    const taxResult = await this.taxService.calculateTax(
      taxLines,
      taxAddress,
      taxAddress,
    );

    // 5. Total
    const total = Math.max(
      parseFloat(
        (subTotal - discount + shipping.cost + taxResult.taxTotal).toFixed(4),
      ),
      0,
    );

    return {
      subTotal: parseFloat(subTotal.toFixed(4)),
      shippingCost: shipping.cost,
      discount: parseFloat(discount.toFixed(4)),
      taxTotal: taxResult.taxTotal,
      total,
      taxBreakdown: taxResult.taxBreakdown,
      coupon: couponSnapshot,
      shippingRule: shipping.rule,
    };
  }
}
