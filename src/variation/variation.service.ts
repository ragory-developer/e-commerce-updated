import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateVariationDto,
  UpdateVariationDto,
  ListVariationsDto,
  CreateVariationValueDto,
  UpdateVariationValueDto,
  ReorderValuesDto,
} from './dto';

// ─── Slugify helper ─────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class VariationService {
  private readonly logger = new Logger(VariationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Generate unique uid ────────────────────────────────────
  private async generateUid(base: string): Promise<string> {
    const baseUid = slugify(base);
    const existing = await this.prisma.variation.findFirst({
      where: { uid: baseUid, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return baseUid;

    let suffix = 1;
    while (true) {
      const candidate = `${baseUid}-${suffix}`;
      const found = await this.prisma.variation.findFirst({
        where: { uid: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!found) return candidate;
      suffix++;
    }
  }

  private async generateValueUid(variationUid: string, label: string): Promise<string> {
    const baseUid = `${variationUid}-${slugify(label)}`;
    const existing = await this.prisma.variationValue.findFirst({
      where: { uid: baseUid, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return baseUid;

    let suffix = 1;
    while (true) {
      const candidate = `${baseUid}-${suffix}`;
      const found = await this.prisma.variationValue.findFirst({
        where: { uid: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!found) return candidate;
      suffix++;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CREATE
  // ══════════════════════════════════════════════════════════════
  async create(dto: CreateVariationDto, createdBy: string): Promise<object> {
    const uid = await this.generateUid(dto.name);

    const variation = await this.prisma.variation.create({
      data: {
        uid,
        name: dto.name,
        type: dto.type,
        isGlobal: dto.isGlobal ?? true,
        position: dto.position ?? 0,
        translations:
          dto.translations !== undefined
            ? (dto.translations as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        createdBy,
      },
    });

    // Create inline values if provided
    if (dto.values && dto.values.length > 0) {
      for (const val of dto.values) {
        const valueUid = await this.generateValueUid(uid, val.label);
        await this.prisma.variationValue.create({
          data: {
            uid: valueUid,
            variationId: variation.id,
            label: val.label,
            value: val.value ?? null,
            position: val.position ?? 0,
            translations:
              val.translations !== undefined
                ? (val.translations as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            createdBy,
          },
        });
      }
    }

    this.logger.log(`Variation created: ${variation.uid} by ${createdBy}`);
    return this.findOne(variation.id);
  }

  // ══════════════════════════════════════════════════════════════
  // FIND ALL
  // ══════════════════════════════════════════════════════════════
  async findAll(dto: ListVariationsDto): Promise<{ data: object[]; total: number; meta: object }> {
    const where: Prisma.VariationWhereInput = {
      deletedAt: null,
      ...(dto.search && {
        name: { contains: dto.search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.variation.findMany({
        where,
        select: {
          id: true,
          uid: true,
          name: true,
          type: true,
          isGlobal: true,
          position: true,
          translations: true,
          createdAt: true,
          updatedAt: true,
          values: {
            where: { deletedAt: null },
            select: {
              id: true,
              uid: true,
              label: true,
              value: true,
              position: true,
              translations: true,
            },
            orderBy: { position: 'asc' },
          },
          _count: {
            select: { productVariations: true },
          },
        },
        orderBy: { position: 'asc' },
        skip: dto.skip,
        take: dto.take,
      }),
      this.prisma.variation.count({ where }),
    ]);

    return {
      data,
      total,
      meta: {
        skip: dto.skip,
        take: dto.take,
        page: Math.floor(dto.skip / dto.take) + 1,
        pageCount: Math.ceil(total / dto.take),
      },
    };
  }

  // ══════════════════════════════════════════════════════════════
  // FIND ONE
  // ══════════════════════════════════════════════════════════════
  async findOne(id: string): Promise<object> {
    const variation = await this.prisma.variation.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        uid: true,
        name: true,
        type: true,
        isGlobal: true,
        position: true,
        translations: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        values: {
          where: { deletedAt: null },
          select: {
            id: true,
            uid: true,
            label: true,
            value: true,
            position: true,
            translations: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { productVariations: true },
        },
      },
    });

    if (!variation) {
      throw new NotFoundException('Variation not found');
    }

    return variation;
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════════════════════
  async update(id: string, dto: UpdateVariationDto, updatedBy: string): Promise<object> {
    const existing = await this.prisma.variation.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, uid: true, name: true },
    });

    if (!existing) {
      throw new NotFoundException('Variation not found');
    }

    // If name changes, regenerate uid and check uniqueness
    let uid = existing.uid;
    if (dto.name && dto.name !== existing.name) {
      const newUidBase = slugify(dto.name);
      if (newUidBase !== existing.uid) {
        const uidExists = await this.prisma.variation.findFirst({
          where: { uid: newUidBase, deletedAt: null, id: { not: id } },
          select: { id: true },
        });
        if (!uidExists) {
          uid = newUidBase;
        }
      }
    }

    const variation = await this.prisma.variation.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name, uid }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.isGlobal !== undefined && { isGlobal: dto.isGlobal }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.translations !== undefined && {
          translations: dto.translations
            ? (dto.translations as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        }),
        updatedBy,
      },
    });

    this.logger.log(`Variation updated: ${variation.uid} by ${updatedBy}`);
    return this.findOne(id);
  }

  // ══════════════════════════════════════════════════════════════
  // REMOVE (SOFT DELETE)
  // ══════════════════════════════════════════════════════════════
  async remove(id: string, deletedBy: string): Promise<void> {
    const variation = await this.prisma.variation.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!variation) {
      throw new NotFoundException('Variation not found');
    }

    // Check if any product uses this variation
    const productCount = await this.prisma.productVariation.count({
      where: { variationId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete variation. ${productCount} products are using this variation`,
      );
    }

    await this.prisma.softDelete('variation', id, deletedBy);
    this.logger.log(`Variation deleted: ${variation.uid} by ${deletedBy}`);
  }

  // ══════════════════════════════════════════════════════════════
  // ADD VALUE
  // ══════════════════════════════════════════════════════════════
  async addValue(
    variationId: string,
    dto: CreateVariationValueDto,
    createdBy: string,
  ): Promise<object> {
    const variation = await this.prisma.variation.findFirst({
      where: { id: variationId, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!variation) {
      throw new NotFoundException('Variation not found');
    }

    const uid = await this.generateValueUid(variation.uid, dto.label);

    const value = await this.prisma.variationValue.create({
      data: {
        uid,
        variationId,
        label: dto.label,
        value: dto.value ?? null,
        position: dto.position ?? 0,
        translations:
          dto.translations !== undefined
            ? (dto.translations as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        createdBy,
      },
    });

    this.logger.log(`Variation value added: ${uid} by ${createdBy}`);
    return value;
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE VALUE
  // ══════════════════════════════════════════════════════════════
  async updateValue(
    variationId: string,
    valueId: string,
    dto: UpdateVariationValueDto,
    updatedBy: string,
  ): Promise<object> {
    const value = await this.prisma.variationValue.findFirst({
      where: { id: valueId, variationId, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!value) {
      throw new NotFoundException('Variation value not found');
    }

    const updated = await this.prisma.variationValue.update({
      where: { id: valueId },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.translations !== undefined && {
          translations: dto.translations
            ? (dto.translations as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        }),
        updatedBy,
      },
    });

    this.logger.log(`Variation value updated: ${value.uid} by ${updatedBy}`);
    return updated;
  }

  // ══════════════════════════════════════════════════════════════
  // REMOVE VALUE (SOFT DELETE)
  // ══════════════════════════════════════════════════════════════
  async removeValue(variationId: string, valueId: string, deletedBy: string): Promise<void> {
    const value = await this.prisma.variationValue.findFirst({
      where: { id: valueId, variationId, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!value) {
      throw new NotFoundException('Variation value not found');
    }

    await this.prisma.softDelete('variationValue', valueId, deletedBy);
    this.logger.log(`Variation value deleted: ${value.uid} by ${deletedBy}`);
  }

  // ══════════════════════════════════════════════════════════════
  // REORDER VALUES
  // ══════════════════════════════════════════════════════════════
  async reorderValues(variationId: string, dto: ReorderValuesDto): Promise<object[]> {
    const variation = await this.prisma.variation.findFirst({
      where: { id: variationId, deletedAt: null },
      select: { id: true },
    });

    if (!variation) {
      throw new NotFoundException('Variation not found');
    }

    await Promise.all(
      dto.items.map((item) =>
        this.prisma.variationValue.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );

    const values = await this.prisma.variationValue.findMany({
      where: { variationId, deletedAt: null },
      select: {
        id: true,
        uid: true,
        label: true,
        value: true,
        position: true,
      },
      orderBy: { position: 'asc' },
    });

    return values;
  }
}
