import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { SellerModule } from 'src/seller/seller.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { VariantsModule } from 'src/variants/variants.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { ConfigModule } from '@nestjs/config';
import { SellerService } from 'src/seller/seller.service';
import { CommonModule } from 'src/common/common.module';
import { CommonService } from 'src/common/common.service';
import { Detalle } from './entities/detail.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService, UserService, SellerService, CommonService],
  imports: [
    TypeOrmModule.forFeature([Order, Detalle]),
    UserModule,
    ProductModule,
    SellerModule,
    VariantsModule,
    AuthModule,
    ConfigModule,
    CommonModule,
  ],
  exports: [TypeOrmModule],
})
export class OrderModule {}
