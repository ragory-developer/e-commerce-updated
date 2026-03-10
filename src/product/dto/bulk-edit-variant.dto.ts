import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type AllowedBulkField = 'price' | 'specialPrice' | 'specialPriceType' | 'manageStock' | 'inStock' | 'qty';

export class BulkEditVariantDto {
  @ApiProperty({
    example: 'price',
    description: "Field to update: 'price' | 'specialPrice' | 'specialPriceType' | 'manageStock' | 'inStock' | 'qty'",
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['price', 'specialPrice', 'specialPriceType', 'manageStock', 'inStock', 'qty'])
  field!: AllowedBulkField;

  @ApiProperty({
    example: 29.99,
    description: 'New value for the field',
  })
  value!: string | number | boolean;
}
