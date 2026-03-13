import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Dhaka Metro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
