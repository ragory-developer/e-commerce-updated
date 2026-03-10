import { IsArray, ValidateNested, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ReorderValueItemDto {
  @ApiProperty({ example: 'clx_value_123', description: 'Variation value ID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 0, description: 'New position' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position!: number;
}

export class ReorderValuesDto {
  @ApiProperty({
    type: [ReorderValueItemDto],
    description: 'Array of value IDs with their new positions',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderValueItemDto)
  items!: ReorderValueItemDto[];
}
