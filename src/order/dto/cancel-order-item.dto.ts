import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelOrderItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() orderProductId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
