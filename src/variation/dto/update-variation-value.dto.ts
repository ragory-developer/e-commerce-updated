import { PartialType } from '@nestjs/swagger';
import { CreateVariationValueDto } from './create-variation-value.dto';

export class UpdateVariationValueDto extends PartialType(CreateVariationValueDto) {}
