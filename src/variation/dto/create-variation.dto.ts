import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsObject,
  IsInt,
  Min,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { VariationType } from '@prisma/client';
import { CreateVariationValueDto } from './create-variation-value.dto';

export class CreateVariationDto {
  @ApiProperty({ example: 'Size', description: 'Variation name (e.g., Size, Color, Storage)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({
    enum: VariationType,
    example: VariationType.TEXT,
    description: 'Variation type: TEXT, COLOR, or IMAGE',
  })
  @IsEnum(VariationType)
  type!: VariationType;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether this variation is available globally across all products',
  })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Display order position' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    type: Object,
    example: { bn: { name: 'সাইজ' }, ar: { name: 'الحجم' } },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;

  @ApiPropertyOptional({
    type: [CreateVariationValueDto],
    description: 'Optional inline values to create with the variation',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationValueDto)
  values?: CreateVariationValueDto[];
}
