import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [CommonService],
  imports: [ConfigModule],
  exports: [CommonService],
})
export class CommonModule {}
