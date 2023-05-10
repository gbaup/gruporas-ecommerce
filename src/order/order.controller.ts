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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/user/entities/user.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseFilters(new HttpExceptionFilter())
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   *
   * @param createOrderDto
   * @param user
   * @returns
   * @description Endpoint de creacion de Orden
   */
  @Post()
  @Auth(ValidRoles.user)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.orderService.insert(createOrderDto, user);
  }

  /**
   *
   * @param user
   * @param paginationDto
   * @returns Order[]
   * @description Endpoint para obtener todas las Ordenes.
   */
  @Get()
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationInput) {
    return this.orderService.findAll(user, paginationDto);
  }

  /**
   *
   * @param id
   * @param user
   * @returns Order
   * @description Endpoint que obtiene una Orden por ID
   */
  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.orderService.getById(id, user);
  }

  /**
   *
   * @param user
   * @param id
   * @param updateOrderDto
   * @returns Order
   * @description Endpoint para editar una orden
   */
  @Patch(':id')
  @Auth(ValidRoles.seller)
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(user, id, updateOrderDto);
  }

  /**
   *
   * @param user
   * @param id
   * @returns string
   * @description Enpoint para el borrado de una orden
   */
  @Delete(':id')
  @Auth(ValidRoles.seller)
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.delete(user, id);
  }
}
