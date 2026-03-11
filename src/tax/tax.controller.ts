// ─── src/tax/tax.controller.ts ────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import {
  CreateTaxClassDto,
  UpdateTaxClassDto,
  CreateTaxRateDto,
  UpdateTaxRateDto,
  ListTaxClassesDto,
} from './dto';
import { UserType } from '../common/decorators/user-type.decorator';

@ApiTags('Tax')
@ApiBearerAuth('access-token')
@Controller('tax')
@UserType('ADMIN')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  // ─── Tax Classes ────────────────────────────────────────────

  @Post('classes')
  @ApiOperation({ summary: 'Create tax class' })
  createClass(@Body() dto: CreateTaxClassDto, @Req() req: any) {
    return this.taxService.createTaxClass(dto);
  }

  @Get('classes')
  @ApiOperation({ summary: 'List tax classes' })
  findAllClasses(@Query() dto: ListTaxClassesDto) {
    return this.taxService.findAllTaxClasses(dto);
  }

  @Get('classes/:id')
  @ApiOperation({ summary: 'Get tax class by ID' })
  findOneClass(@Param('id') id: string) {
    return this.taxService.findOneTaxClass(id);
  }

  @Patch('classes/:id')
  @ApiOperation({ summary: 'Update tax class' })
  updateClass(@Param('id') id: string, @Body() dto: UpdateTaxClassDto) {
    return this.taxService.updateTaxClass(id, dto);
  }

  @Delete('classes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tax class (soft)' })
  removeClass(@Param('id') id: string, @Req() req: any) {
    return this.taxService.removeTaxClass(id, req.user.sub);
  }

  // ─── Tax Rates ──────────────────────────────────────────────

  @Post('rates')
  @ApiOperation({ summary: 'Create tax rate' })
  createRate(@Body() dto: CreateTaxRateDto) {
    return this.taxService.createTaxRate(dto);
  }

  @Patch('rates/:id')
  @ApiOperation({ summary: 'Update tax rate' })
  updateRate(@Param('id') id: string, @Body() dto: UpdateTaxRateDto) {
    return this.taxService.updateTaxRate(id, dto);
  }

  @Delete('rates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tax rate (soft)' })
  removeRate(@Param('id') id: string, @Req() req: any) {
    return this.taxService.removeTaxRate(id, req.user.sub);
  }
}
