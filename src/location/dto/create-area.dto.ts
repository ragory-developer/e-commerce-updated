import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 'Dhanmondi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ example: 'ধানমন্ডি' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  bnName?: string;

  @ApiProperty({ example: '1205' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  postalCode!: string;

  @ApiProperty({ example: 'clx_city_001' })
  @IsString()
  @IsNotEmpty()
  cityId!: string;

  @ApiProperty({ example: 'clx_zone_001' })
  @IsString()
  @IsNotEmpty()
  deliveryZoneId!: string;
}
