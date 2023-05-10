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
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from './entities/user.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseFilters(new HttpExceptionFilter())
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @param paginationDto
   * @returns User[]
   * @description Endpoint que devuelve todos los Usuarios
   */
  @Get()
  @Auth(ValidRoles.admin)
  findAll(@Query() paginationDto: PaginationInput) {
    return this.userService.findAll(paginationDto);
  }

  /**
   * @param id
   * @returns User
   * @description Endpoint que devuelve un Usuario dependiendo su ID.
   */
  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * @param id
   * @param updateUserDto
   * @returns User
   * @description Endpoint que actualiza un Usuario dependiendo su ID.
   */
  @Patch(':id')
  @Auth(ValidRoles.user)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  /**
   * @param id
   * @returns string
   * @description Endpoint que Elimina un Usuario dependiendo su ID.
   */
  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.userService.remove(id, user);
  }
}
