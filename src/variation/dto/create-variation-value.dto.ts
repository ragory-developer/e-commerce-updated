import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsObject,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateVariationValueDto {
  @ApiProperty({ example: 'Small', description: 'Display label for the variation value' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Transform(({ value }) => value?.trim())
  label!: string;

  @ApiPropertyOptional({
    example: '#FF0000',
    description: 'Hex color for COLOR type, image URL for IMAGE type, or text value',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  value?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Display order position' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    type: Object,
    example: { bn: { label: 'ছোট' }, ar: { label: 'صغير' } },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;
}
