// ─── src/location/location.service.ts ─────────────────────────

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDivisionDto, CreateCityDto, CreateAreaDto } from './dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Divisions ───────────────────────────────────────────────
  async createDivision(dto: CreateDivisionDto) {
    const exists = await this.prisma.division.findFirst({
      where: { name: dto.name, deletedAt: null },
    });
    if (exists) throw new ConflictException(`Division "${dto.name}" already exists`);

    return this.prisma.division.create({
      data: { name: dto.name, bnName: dto.bnName ?? null },
    });
  }

  async findAllDivisions() {
    return this.prisma.division.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { cities: true } } },
      orderBy: { name: 'asc' },
    });
  }

  // ── Cities ──────────────────────────────────────────────────
  async createCity(dto: CreateCityDto) {
    const division = await this.prisma.division.findFirst({
      where: { id: dto.divisionId, deletedAt: null },
    });
    if (!division) throw new NotFoundException('Division not found');

    return this.prisma.city.create({
      data: {
        name: dto.name,
        bnName: dto.bnName ?? null,
        divisionId: dto.divisionId,
      },
    });
  }

  async findCitiesByDivision(divisionId: string) {
    return this.prisma.city.findMany({
      where: { divisionId, deletedAt: null },
      include: { _count: { select: { areas: true } } },
      orderBy: { name: 'asc' },
    });
  }

  // ── Areas ───────────────────────────────────────────────────
  async createArea(dto: CreateAreaDto) {
    const city = await this.prisma.city.findFirst({
      where: { id: dto.cityId, deletedAt: null },
    });
    if (!city) throw new NotFoundException('City not found');

    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id: dto.deliveryZoneId, deletedAt: null },
    });
    if (!zone) throw new NotFoundException('Delivery zone not found');

    return this.prisma.area.create({
      data: {
        name: dto.name,
        bnName: dto.bnName ?? null,
        postalCode: dto.postalCode,
        cityId: dto.cityId,
        deliveryZoneId: dto.deliveryZoneId,
      },
    });
  }

  async findAreasByCity(cityId: string) {
    return this.prisma.area.findMany({
      where: { cityId, deletedAt: null },
      include: { deliveryZone: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  // ── Lookup: Area → full location chain ──────────────────────
  async resolveArea(areaId: string) {
    const area = await this.prisma.area.findFirst({
      where: { id: areaId, deletedAt: null },
      include: {
        city: {
          include: { division: true },
        },
        deliveryZone: true,
      },
    });
    if (!area) throw new NotFoundException('Area not found');
    return area;
  }
}
