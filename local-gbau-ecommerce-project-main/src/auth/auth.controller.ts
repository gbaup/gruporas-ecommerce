import { Controller, Post, Body, Get, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateSellerDto } from '../seller/dto/create-seller.dto';
import { Auth, GetUser } from './decorators';
import { User } from '../user/entities/user.entity';
import { Seller } from '../seller/entities/seller.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';
@ApiTags('Auth')
@Controller('auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * @param user
   * @returns user
   * @description Devuelve informacion del Usuario o Seller logueado.
   */
  @Get('me')
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'Peticion exitosa',
    type: User || Seller,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, token related' })
  userData(@GetUser() user: User | Seller) {
    return this.authService.userData(user);
  }

  /**
   *
   * @param createUserDto
   * @returns token: string
   * @description Endpoint de registro de Usuario
   */
  @ApiResponse({
    status: 201,
    description: 'Registro exitoso',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('user/register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  /**
   *
   * @param loginUserDto
   * @returns
   * @description Enpoint de login de Usuario
   */
  @ApiResponse({
    status: 201,
    description: 'Login exitoso',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, token related' })
  @ApiBearerAuth('access-token')
  @Post('user/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  /**
   *
   * @param createSellerDto
   * @returns
   * @description Endpoint de registro de Seller
   */
  @ApiResponse({
    status: 201,
    description: 'Registro exitoso',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('seller/register')
  createSeller(@Body() createSellerDto: CreateSellerDto) {
    return this.authService.createSeller(createSellerDto);
  }

  /**
   *
   * @param loginUserDto
   * @returns
   * @description Enpoint de login de seller
   */
  @ApiResponse({
    status: 201,
    description: 'Login exitoso',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, token related' })
  @ApiBearerAuth('access-token')
  @Post('seller/login')
  loginSeller(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginSeller(loginUserDto);
  }
}
