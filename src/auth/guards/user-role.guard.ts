import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   *
   * @param context
   * @returns bool
   * @description Permite o no el acceso a endpoints dependiendo del Rol y tipo de Usuario.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    let type = req.authInfo;
    let rol = user.rol;

    if (rol === 'admin') {
      return true;
    }

    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (validRoles.includes(type)) {
      return true;
    }

    throw new ForbiddenException(
      `El usuario '${user.firstName}' necesita el rol valido: [${validRoles}]`,
    );
  }
}
