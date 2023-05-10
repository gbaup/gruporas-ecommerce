import { Module } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { ProductModule } from 'src/product/product.module';
import { Variant } from './entities/variant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Product } from 'src/product/entities/product.entity';
import { CommonModule } from 'src/common/common.module';
import { CommonService } from 'src/common/common.service';
import { AuthModule } from 'src/auth/auth.module';

import { ProductService } from 'src/product/product.service';

@Module({
  controllers: [VariantsController],
  providers: [VariantsService, CommonService, ProductService],
  imports: [
    TypeOrmModule.forFeature([Variant, Product]),
    ConfigModule,
    ProductModule,
    CommonModule,
    AuthModule,
  ],
  exports: [VariantsService, TypeOrmModule],
})
export class VariantsModule {}
