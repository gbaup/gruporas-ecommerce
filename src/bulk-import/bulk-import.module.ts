import { Module } from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';
import { BulkImportController } from './bulk-import.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from 'src/product/product.module';
import { VariantsModule } from 'src/variants/variants.module';

@Module({
  controllers: [BulkImportController],
  providers: [BulkImportService],
  imports: [ConfigModule, AuthModule, ProductModule, VariantsModule],
})
export class BulkImportModule {}
