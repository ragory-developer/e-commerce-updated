// ─── src/shipping/shipping.service.ts ─────────────────────────

import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateDeliveryZoneDto,
  CreateCourierDto,
  CreateShippingRuleDto,
} from './dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ══════ Delivery Zone ═══════════════════════════════════════
  async createZone(dto: CreateDeliveryZoneDto) {
    const slug = slugify(dto.name);
    const exists = await this.prisma.deliveryZone.findFirst({
      where: { slug, deletedAt: null },
    });
    if (exists) throw new ConflictException('Delivery zone already exists');

    return this.prisma.deliveryZone.create({
      data: { name: dto.name, slug },
    });
  }

  async findAllZones() {
    return this.prisma.deliveryZone.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        _count: { select: { areas: true, shippingRules: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ══════ Courier ═════════════════════════════════════════════
  async createCourier(dto: CreateCourierDto) {
    const slug = slugify(dto.name);
    return this.prisma.courier.create({
      data: {
        name: dto.name,
        slug,
        logo: dto.logo ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
      },
    });
  }

  async findAllCouriers() {
    return this.prisma.courier.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ══════ Shipping Rules ══════════════════════════════════════
  async createRule(dto: CreateShippingRuleDto) {
    // Validate zone + courier
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id: dto.deliveryZoneId, deletedAt: null },
    });
    if (!zone) throw new NotFoundException('Delivery zone not found');

    const courier = await this.prisma.courier.findFirst({
      where: { id: dto.courierId, deletedAt: null },
    });
    if (!courier) throw new NotFoundException('Courier not found');

    return this.prisma.shippingRule.create({
      data: {
        deliveryZoneId: dto.deliveryZoneId,
        courierId: dto.courierId,
        ruleType: (dto.ruleType as any) ?? 'FLAT',
        baseCost: new Prisma.Decimal(dto.baseCost),
        perKgCost: new Prisma.Decimal(dto.perKgCost ?? 0),
        freeShippingMinimum: dto.freeShippingMinimum
          ? new Prisma.Decimal(dto.freeShippingMinimum)
          : null,
        estimatedMinDays: dto.estimatedMinDays ?? 1,
        estimatedMaxDays: dto.estimatedMaxDays ?? 3,
      },
      include: {
        deliveryZone: { select: { id: true, name: true } },
        courier: { select: { id: true, name: true } },
      },
    });
  }

  async findRulesByZone(deliveryZoneId: string) {
    return this.prisma.shippingRule.findMany({
      where: { deliveryZoneId, isActive: true, deletedAt: null },
      include: { courier: { select: { id: true, name: true, slug: true } } },
      orderBy: { baseCost: 'asc' },
    });
  }

  // ── CORE: Calculate shipping cost for checkout ──────────────
  async calculateShipping(
    deliveryZoneId: string,
    courierId: string,
    subtotal: number,
    totalWeight?: number,
  ): Promise<{
    cost: number;
    rule: any;
  }> {
    const rule = await this.prisma.shippingRule.findFirst({
      where: {
        deliveryZoneId,
        courierId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        deliveryZone: { select: { id: true, name: true } },
        courier: { select: { id: true, name: true } },
      },
    });

    if (!rule) {
      throw new NotFoundException(
        'No shipping rule found for this zone and courier',
      );
    }

    let cost = rule.baseCost.toNumber();

    switch (rule.ruleType) {
      case 'WEIGHT_BASED':
        cost += (totalWeight ?? 0) * rule.perKgCost.toNumber();
        break;

      case 'PRICE_BASED':
        if (
          rule.freeShippingMinimum &&
          subtotal >= rule.freeShippingMinimum.toNumber()
        ) {
          cost = 0;
        }
        break;

      case 'FLAT':
      default:
        // cost = baseCost (already set)
        break;
    }

    return { cost: parseFloat(cost.toFixed(2)), rule };
  }

  // ── Get available shipping options for area ─────────────────
  async getShippingOptionsForArea(areaId: string) {
    const area = await this.prisma.area.findFirst({
      where: { id: areaId, deletedAt: null },
      select: { deliveryZoneId: true },
    });
    if (!area) throw new NotFoundException('Area not found');

    return this.findRulesByZone(area.deliveryZoneId);
  }
}
