// ─── Admin order management ───────────────────────────────────

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderQueryService } from './services/order-query.service';
import { OrderService } from './services/order.service';
import { ListOrdersDto, UpdateOrderStatusDto } from './dto';
import { UserType } from '../common/decorators/user-type.decorator';

@ApiTags('Orders (Admin)')
@ApiBearerAuth()
@Controller('admin/orders')
@UserType('ADMIN')
export class OrderAdminController {
  constructor(
    private readonly queryService: OrderQueryService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  findAll(@Query() dto: ListOrdersDto) {
    return this.queryService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@Param('id') id: string) {
    return this.queryService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.orderService.updateStatus(id, dto, req.user.sub);
  }
}
