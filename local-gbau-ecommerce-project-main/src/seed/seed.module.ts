import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UserModule } from 'src/user/user.module';
import { SellerModule } from 'src/seller/seller.module';
import { ProductModule } from 'src/product/product.module';
import { VariantsModule } from 'src/variants/variants.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    UserModule,
    SellerModule,
    ProductModule,
    VariantsModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
