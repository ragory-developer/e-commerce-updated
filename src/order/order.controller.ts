// ─── Customer-facing order endpoints ──────────────────────────

import { Controller, Get, Post, Param, Body, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './services/order.service';
import { OrderQueryService } from './services/order-query.service';
import { CheckoutDto, CancelOrderItemDto } from './dto';
import { UserType } from '../common/decorators/user-type.decorator';

@ApiTags('Orders (Customer)')
@ApiBearerAuth()
@Controller('orders')
@UserType('CUSTOMER')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly queryService: OrderQueryService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Place order (checkout)' })
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    return this.orderService.checkout(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'My orders' })
  myOrders(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.queryService.findCustomerOrders(
      req.user.sub,
      Number(skip) || 0,
      Number(take) || 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Order detail' })
  getOrder(@Param('id') id: string) {
    return this.queryService.findOne(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.orderService.cancelOrder(id, req.user.sub);
  }

  @Post(':id/cancel-item')
  @ApiOperation({ summary: 'Cancel single item' })
  cancelItem(
    @Param('id') id: string,
    @Body() dto: CancelOrderItemDto,
    @Req() req: any,
  ) {
    return this.orderService.cancelOrderItem(id, dto, req.user.sub);
  }
}
