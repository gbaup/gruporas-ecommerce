import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VariantsModule } from './variants/variants.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { BulkImportModule } from './bulk-import/bulk-import.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),

    UserModule,
    PersonModule,
    ProductModule,
    OrderModule,
    VariantsModule,
    AuthModule,
    CommonModule,
    SeedModule,
    BulkImportModule,
    MessagesWsModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
