import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ListProductsDto {
  @ApiPropertyOptional({ example: 0, default: 0, description: 'Skip records' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Take records' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;

  @ApiPropertyOptional({ example: 't-shirt', description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'clx_brand_123', description: 'Filter by brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'clx_cat_123', description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
