import {
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';

import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { Seller } from 'src/seller/entities/seller.entity';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Bulk-Import')
@ApiBearerAuth('access-token')
@Controller('bulk-import')
@UseFilters(new HttpExceptionFilter())
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Auth(ValidRoles.seller)
  @UseInterceptors(FileInterceptor('file'))
  create(@GetUser() seller: Seller, @UploadedFile() file: Express.Multer.File) {
    return this.bulkImportService.upload(file, seller);
  }
}
