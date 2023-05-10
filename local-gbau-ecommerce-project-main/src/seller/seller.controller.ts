import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { Seller } from './entities/seller.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@ApiTags('Sellers')
@ApiBearerAuth('access-token')
@Controller('seller')
@UseFilters(new HttpExceptionFilter())
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  /**
   * @description Endpoint que devuelve todos los Sellers.
   * @param paginationInput
   */
  @Get()
  @Auth(ValidRoles.admin, ValidRoles.seller)
  findAll(@Query() paginationInput: PaginationInput) {
    return this.sellerService.findAll(paginationInput);
  }

  /**
   * @description Endpoint que devuelve un Seller por su Id.
   * @param id
   */
  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellerService.findOne(id);
  }

  /**
   * @description Endpoint que actualiza un Seller por su Id.
   * @param id
   * @param updateSellerDto
   */
  @Patch(':id')
  @Auth(ValidRoles.seller)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @GetUser() seller: Seller,
  ) {
    return this.sellerService.update(id, updateSellerDto, seller);
  }

  /**
   * @description Endpoint que elimina un Seller por su Id.
   * @param id
   */
  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellerService.remove(id);
  }
}
