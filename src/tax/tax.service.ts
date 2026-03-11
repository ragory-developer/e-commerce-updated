// ─── src/tax/tax.service.ts ───────────────────────────────────

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TaxBasedOn } from '@prisma/client';
import {
  CreateTaxClassDto,
  UpdateTaxClassDto,
  CreateTaxRateDto,
  UpdateTaxRateDto,
  ListTaxClassesDto,
} from './dto';

// ─── Tax Calculation Types ────────────────────────────────────

export interface TaxLineInput {
  productId: string;
  taxClassId: string | null;
  lineTotal: number; // subtotal for this line (unitPrice × qty)
}

export interface TaxCalculationResult {
  taxTotal: number;
  taxBreakdown: Array<{
    taxRateId: string;
    rateName: string;
    rateValue: number; // e.g. 15.0000
    amount: number; // calculated tax amount
  }>;
}

export interface AddressForTax {
  country: string;
  state?: string;
  city?: string;
  zip?: string;
}

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ══════════════════════════════════════════════════════════════
  // TAX CLASS CRUD
  // ══════════════════════════════════════════════════════════════

  async createTaxClass(dto: CreateTaxClassDto) {
    return this.prisma.taxClass.create({
      data: {
        name: dto.name,
        basedOn: dto.basedOn ?? TaxBasedOn.SHIPPING_ADDRESS,
        translations: dto.translations
          ? (dto.translations as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
      include: { rates: true },
    });
  }

  async findAllTaxClasses(dto: ListTaxClassesDto) {
    const where: Prisma.TaxClassWhereInput = {
      deletedAt: null,
      ...(dto.search && {
        name: { contains: dto.search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.taxClass.findMany({
        where,
        include: {
          rates: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
          },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: dto.skip,
        take: dto.take,
      }),
      this.prisma.taxClass.count({ where }),
    ]);

    return { data, total, meta: { skip: dto.skip, take: dto.take } };
  }

  async findOneTaxClass(id: string) {
    const taxClass = await this.prisma.taxClass.findFirst({
      where: { id, deletedAt: null },
      include: {
        rates: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!taxClass) throw new NotFoundException('Tax class not found');
    return taxClass;
  }

  async updateTaxClass(id: string, dto: UpdateTaxClassDto) {
    await this.findOneTaxClass(id);
    return this.prisma.taxClass.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.basedOn !== undefined && { basedOn: dto.basedOn }),
        ...(dto.translations !== undefined && {
          translations: dto.translations as Prisma.InputJsonValue,
        }),
      },
      include: { rates: { where: { deletedAt: null } } },
    });
  }

  async removeTaxClass(id: string, deletedBy: string) {
    await this.findOneTaxClass(id);
    await this.prisma.softDelete('taxClass', id, deletedBy);
  }

  // ══════════════════════════════════════════════════════════════
  // TAX RATE CRUD
  // ══════════════════════════════════════════════════════════════

  async createTaxRate(dto: CreateTaxRateDto) {
    await this.findOneTaxClass(dto.taxClassId);
    return this.prisma.taxRate.create({
      data: {
        taxClassId: dto.taxClassId,
        name: dto.name,
        country: dto.country.toUpperCase(),
        state: dto.state ?? '*',
        city: dto.city ?? '*',
        zip: dto.zip ?? '*',
        rate: new Prisma.Decimal(dto.rate),
        position: dto.position ?? 0,
        translations: dto.translations
          ? (dto.translations as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }

  async updateTaxRate(id: string, dto: UpdateTaxRateDto) {
    const existing = await this.prisma.taxRate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Tax rate not found');

    return this.prisma.taxRate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.country !== undefined && {
          country: dto.country.toUpperCase(),
        }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.zip !== undefined && { zip: dto.zip }),
        ...(dto.rate !== undefined && { rate: new Prisma.Decimal(dto.rate) }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.translations !== undefined && {
          translations: dto.translations as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async removeTaxRate(id: string, deletedBy: string) {
    const existing = await this.prisma.taxRate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Tax rate not found');
    await this.prisma.softDelete('taxRate', id, deletedBy);
  }

  // ══════════════════════════════════════════════════════════════
  // CORE: CALCULATE TAX FOR ORDER
  // ══════════════════════════════════════════════════════════════
  // This is the method OrderCalculatorService will call.
  //
  // Algorithm:
  // 1. Group line items by taxClassId
  // 2. For each tax class, determine address (based on TaxClass.basedOn)
  // 3. Find matching TaxRates for that address
  // 4. Apply rates to line totals
  // 5. Return total tax + breakdown for OrderTax records

  async calculateTax(
    lines: TaxLineInput[],
    shippingAddress: AddressForTax,
    billingAddress: AddressForTax,
  ): Promise<TaxCalculationResult> {
    const breakdown: TaxCalculationResult['taxBreakdown'] = [];
    let taxTotal = 0;

    // Group lines by taxClassId
    const linesByTaxClass = new Map<string, number>();
    for (const line of lines) {
      if (!line.taxClassId) continue; // no tax class = tax-exempt
      const current = linesByTaxClass.get(line.taxClassId) ?? 0;
      linesByTaxClass.set(line.taxClassId, current + line.lineTotal);
    }

    if (linesByTaxClass.size === 0) {
      return { taxTotal: 0, taxBreakdown: [] };
    }

    // Load tax classes with their rates
    const taxClassIds = Array.from(linesByTaxClass.keys());
    const taxClasses = await this.prisma.taxClass.findMany({
      where: { id: { in: taxClassIds }, deletedAt: null },
      include: {
        rates: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    });

    for (const taxClass of taxClasses) {
      const lineTotal = linesByTaxClass.get(taxClass.id) ?? 0;
      if (lineTotal <= 0) continue;

      // Determine which address to use
      const address =
        taxClass.basedOn === TaxBasedOn.BILLING_ADDRESS
          ? billingAddress
          : shippingAddress;

      // Find matching rates (most specific first)
      const matchingRates = this.findMatchingRates(taxClass.rates, address);

      for (const rate of matchingRates) {
        const rateValue = rate.rate.toNumber();
        const amount = parseFloat(((lineTotal * rateValue) / 100).toFixed(4));

        breakdown.push({
          taxRateId: rate.id,
          rateName: rate.name,
          rateValue,
          amount,
        });

        taxTotal += amount;
      }
    }

    return {
      taxTotal: parseFloat(taxTotal.toFixed(4)),
      taxBreakdown: breakdown,
    };
  }

  // ─── Rate Matching Logic ────────────────────────────────────
  // Priority: exact country+state+city+zip > country+state+city > country+state > country > wildcard
  private findMatchingRates(
    rates: Array<{
      id: string;
      country: string;
      state: string;
      city: string;
      zip: string;
      rate: Prisma.Decimal;
      name: string;
    }>,
    address: AddressForTax,
  ) {
    return rates.filter((rate) => {
      const countryMatch =
        rate.country === '*' ||
        rate.country.toUpperCase() === (address.country ?? '').toUpperCase();
      const stateMatch =
        rate.state === '*' ||
        rate.state.toLowerCase() === (address.state ?? '').toLowerCase();
      const cityMatch =
        rate.city === '*' ||
        rate.city.toLowerCase() === (address.city ?? '').toLowerCase();
      const zipMatch = rate.zip === '*' || rate.zip === (address.zip ?? '');

      return countryMatch && stateMatch && cityMatch && zipMatch;
    });
  }
}
