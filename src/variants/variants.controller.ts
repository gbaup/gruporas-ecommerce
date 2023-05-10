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
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@ApiTags('Variants')
@Controller('variants')
@UseFilters(new HttpExceptionFilter())
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  /**
   * @param createVariantDto
   * @returns Variant
   * @description Endpoint que Crea una Variant.
   */
  @Post()
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  insert(@Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.insert(createVariantDto);
  }

  /**
   * @param paginationDto
   * @returns Variant[]
   * @description Endpoint que devuelve todas las Variants.
   */
  @Get()
  getAll(@Query() paginationDto: PaginationInput) {
    return this.variantsService.getAll(paginationDto);
  }

  /**
   * @param id
   * @returns Variant
   * @description Endpoint que devuelve una Variant dado su Id.
   */
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantsService.getById(id);
  }

  /**
   * @param id
   * @param createVariantDto
   * @returns Variant
   * @description Endpoint que Actualiza una Variant.
   */
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.update(id, updateVariantDto);
  }

  /**
   * @param id
   * @returns string
   * @description Endpoint que Elimina una Variant dado su Id.
   */
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Auth(ValidRoles.seller)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantsService.delete(id);
  }
}
