import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { Seller } from 'src/seller/entities/seller.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@ApiTags('Products')
@UseFilters(new HttpExceptionFilter())
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   *
   * @param paginationDto
   * @description Endpoint para obtener todos los Productos.
   */
  @Get()
  findAll(@Query() paginationDto: PaginationInput) {
    return this.productService.getAll(paginationDto);
  }

  /**
   *
   * @param id
   * @description Endpoint para obtener un Producto por su Id.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getById(id);
  }

  /**
   *
   * @param createProductDto
   * @description Endpoint para crear un Producto.
   */
  @Post()
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  create(
    @GetUser() seller: Seller,

    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.insert(createProductDto, seller);
  }

  /**
   * @param id
   * @param createProductDto
   * @description Endpoint para actualizar un Producto.
   */
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  update(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() seller: Seller,
  ) {
    return this.productService.update(id, updateProductDto, seller);
  }

  /**
   *
   * @param id
   * @description Endpoint para eliminar un Producto.
   */
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  remove(@GetUser() seller: Seller, @Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id, seller);
  }
}
