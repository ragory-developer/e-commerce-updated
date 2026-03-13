import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDivisionDto {
  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'ঢাকা' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bnName?: string;
}
