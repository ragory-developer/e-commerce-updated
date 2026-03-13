import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UserType } from '../common/decorators/user-type.decorator';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ManualAdjustDto {
  @ApiProperty() @IsString() @IsNotEmpty() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() productVariantId?: string;
  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  newQty!: number;
  @ApiProperty({ example: 'Received from supplier' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UserType('ADMIN')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust')
  @ApiOperation({ summary: 'Manual stock adjustment' })
  adjust(@Body() dto: ManualAdjustDto, @Req() req: any) {
    return this.inventoryService.manualAdjust(
      dto.productId,
      dto.productVariantId ?? null,
      dto.newQty,
      dto.reason,
      req.user.sub,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get inventory logs' })
  logs(
    @Query('productId') productId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.inventoryService.getLogs(
      productId,
      Number(skip) || 0,
      Number(take) || 50,
    );
  }
}
