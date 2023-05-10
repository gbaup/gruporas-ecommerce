import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Seller } from 'src/seller/entities/seller.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { id, type } = payload;
    let user: Seller | User;

    if (type === 'user') {
      user = await this.userRepository.findOneBy({ id });
    }
    if (type === 'seller') {
      user = await this.sellerRepository.findOneBy({ id });
    }

    if (!user) throw new UnauthorizedException('El token no es valido');

    if (!user.isActive)
      throw new UnauthorizedException('El usuario esta inactivo.');

    return [user, type];
  }
}
