// ─── src/location/location.controller.ts ──────────────────────

import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateDivisionDto, CreateCityDto, CreateAreaDto } from './dto';
import { Public } from '../common/decorators/public.decorator';
import { UserType } from '../common/decorators/user-type.decorator';

@ApiTags('Location')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ── Public: Customers need these for address selection ──────

  @Get('divisions')
  @Public()
  @ApiOperation({ summary: 'List all divisions' })
  getDivisions() {
    return this.locationService.findAllDivisions();
  }

  @Get('divisions/:divisionId/cities')
  @Public()
  @ApiOperation({ summary: 'List cities in a division' })
  getCities(@Param('divisionId') divisionId: string) {
    return this.locationService.findCitiesByDivision(divisionId);
  }

  @Get('cities/:cityId/areas')
  @Public()
  @ApiOperation({ summary: 'List areas in a city' })
  getAreas(@Param('cityId') cityId: string) {
    return this.locationService.findAreasByCity(cityId);
  }

  // ── Admin: CRUD ─────────────────────────────────────────────

  @Post('divisions')
  @ApiBearerAuth()
  @UserType('ADMIN')
  @ApiOperation({ summary: 'Create division (Admin)' })
  createDivision(@Body() dto: CreateDivisionDto) {
    return this.locationService.createDivision(dto);
  }

  @Post('cities')
  @ApiBearerAuth()
  @UserType('ADMIN')
  @ApiOperation({ summary: 'Create city (Admin)' })
  createCity(@Body() dto: CreateCityDto) {
    return this.locationService.createCity(dto);
  }

  @Post('areas')
  @ApiBearerAuth()
  @UserType('ADMIN')
  @ApiOperation({ summary: 'Create area (Admin)' })
  createArea(@Body() dto: CreateAreaDto) {
    return this.locationService.createArea(dto);
  }
}
