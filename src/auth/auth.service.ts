import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Seller } from '../seller/entities/seller.entity';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateSellerDto } from 'src/seller/dto/create-seller.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
  ) {}

  async userData(user: User | Seller) {
    delete user.password;
    return user;
  }

  /**
   *
   * @param createUserDto
   * @returns token: string
   * @description Funcion que crea un Usuario
   */
  async createUser(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    await this.userRepository.save(user);
    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
    // TODO: Retornar el JWT de acceso
  }

  /**
   *
   * @param loginUserDto
   * @returns token: string
   * @description Funcion que permite loguearse a un usuario
   */
  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException('Las credenciales son incorrectas');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Las credenciales son incorrectas');

    const type = 'user';

    return {
      token: this.getJwtToken({ id: user.id, type: type }),
    };
  }

  /**
   *
   * @param createSellerDto
   * @returns token: string
   * @description Funcion que crea un Seller
   */
  async createSeller(createSellerDto: CreateSellerDto) {
    const { password, ...userData } = createSellerDto;

    const user = this.sellerRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    await this.sellerRepository.save(user);
    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  /**
   *
   * @param loginUserDto
   * @returns token: string
   * @description Funcion que permite el logueo de un Seller
   */
  async loginSeller(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.sellerRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }, //! OJO!
    });

    if (!user)
      throw new UnauthorizedException('Las credenciales son incorrectas');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Las credenciales son incorrectas');

    const type = 'seller';

    return {
      token: this.getJwtToken({ id: user.id, type: type }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
