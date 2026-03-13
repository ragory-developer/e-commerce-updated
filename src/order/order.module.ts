import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderAdminController } from './order-admin.controller';
import { OrderService } from './services/order.service';
import { OrderValidatorService } from './services/order-validator.service';
import { OrderCalculatorService } from './services/order-calculator.service';
import { OrderQueryService } from './services/order-query.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaxModule } from '../tax/tax.module';
import { CouponModule } from '../coupon/coupon.module';
import { InventoryModule } from '../inventory/inventory.module';
import { LocationModule } from '../location/location.module';
import { ShippingModule } from '../shipping/shipping.module';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [
    PrismaModule,
    TaxModule, // for calculateTax()
    CouponModule, // for validateCoupon()
    InventoryModule, // for deductStock() / restoreStock()
    LocationModule, // for resolveArea()
    ShippingModule, // for calculateShipping()
    AddressModule, // for saveFromOrder()
  ],
  controllers: [OrderController, OrderAdminController],
  providers: [
    OrderService,
    OrderValidatorService,
    OrderCalculatorService,
    OrderQueryService,
  ],
  exports: [OrderService, OrderQueryService],
})
export class OrderModule {}
