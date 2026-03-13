import {
  Controller, Get, Post, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import {
  CreateDeliveryZoneDto,
  CreateCourierDto,
  CreateShippingRuleDto,
} from './dto';
import { Public } from '../common/decorators/public.decorator';
import { UserType } from '../common/decorators/user-type.decorator';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // ── Public: Customer selects courier during checkout ─────────

  @Get('options/:areaId')
  @Public()
  @ApiOperation({ summary: 'Get shipping options for an area' })
  getOptions(@Param('areaId') areaId: string) {
    return this.shippingService.getShippingOptionsForArea(areaId);
  }

  @Get('zones')
  @Public()
  @ApiOperation({ summary: 'List delivery zones' })
  getZones() { return this.shippingService.findAllZones(); }

  @Get('couriers')
  @Public()
  @ApiOperation({ summary: 'List couriers' })
  getCouriers() { return this.shippingService.findAllCouriers(); }

  // ── Admin CRUD ──────────────────────────────────────────────

  @Post('zones')
  @ApiBearerAuth()
  @UserType('ADMIN')
  createZone(@Body() dto: CreateDeliveryZoneDto) {
    return this.shippingService.createZone(dto);
  }

  @Post('couriers')
  @ApiBearerAuth()
  @UserType('ADMIN')
  createCourier(@Body() dto: CreateCourierDto) {
    return this.shippingService.createCourier(dto);
  }

  @Post('rules')
  @ApiBearerAuth()
  @UserType('ADMIN')
  createRule(@Body() dto: CreateShippingRuleDto) {
    return this.shippingService.createRule(dto);
  }
}
