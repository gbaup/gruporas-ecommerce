import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '../common/common.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * @param paginationInput
   * @returns User[]
   * @description Funcion que devuelve todos los Usuario dependiendo la paginacion.
   */
  async findAll(paginationInput: PaginationInput) {
    const limit = paginationInput.limit || +this.configService.get('PAG_LIMIT');

    const allUser = await this.usersRepository.findAndCount({
      where: { isActive: true },
      take: limit,
      skip: (paginationInput.page - 1) * limit,
    });
    const count = allUser[1];

    const { next, prev, pages } = this.commonService.getNextPrev(
      paginationInput,
      count,
      'user',
    );

    return [allUser[0], next, prev, pages];
  }

  /**
   * @param id
   * @returns User
   * @description Funcion que devuelve un Usuario dependiendo su ID.
   */
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      select: { id: true, firstName: true, lastName: true, adress: true },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    return user;
  }

  /**
   * @param id
   * @param updateUserDto
   * @returns User
   * @description Funcion que Actualiza un Usuario dependiendo su ID.
   */
  async update(id: string, updateUserDto: UpdateUserDto, user: User) {
    if (id !== user.id) {
      throw new ForbiddenException(
        'No tiene permisos para modificar otro usuario',
      );
    }
    await this.findOne(id);
    const usuario = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });
    await this.usersRepository.save(usuario);
    delete usuario.password;
    return usuario;
  }

  /**
   * @param id
   * @returns string
   * @description Funcion que Elimina un Usuario dependiendo su ID.
   */
  async remove(id: string, user: User) {
    if (id !== user.id) {
      throw new ForbiddenException(
        'No tiene permisos para modificar otro usuario',
      );
    }
    await this.findOne(id);
    const usuario = await this.usersRepository.preload({
      id,
      isActive: false,
    });

    await this.usersRepository.save(usuario);

    return 'Usuario eliminado exitosamente';
  }
}
