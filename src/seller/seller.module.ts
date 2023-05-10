import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { PersonModule } from 'src/person/person.module';
import { Seller } from './entities/seller.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [SellerController],
  providers: [SellerService],
  imports: [
    TypeOrmModule.forFeature([Seller]),
    PersonModule,
    AuthModule,
    CommonModule,
    ConfigModule,
  ],
  exports: [TypeOrmModule],
})
export class SellerModule {}
