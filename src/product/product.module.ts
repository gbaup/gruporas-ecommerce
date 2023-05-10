import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CommonService } from 'src/common/common.service';
import { Variant } from 'src/variants/entities/variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Variant]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CommonService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
