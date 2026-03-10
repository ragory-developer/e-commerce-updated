import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VariationController } from './variation.controller';
import { VariationService } from './variation.service';

@Module({
  imports: [PrismaModule],
  controllers: [VariationController],
  providers: [VariationService],
  exports: [VariationService],
})
export class VariationModule {}
