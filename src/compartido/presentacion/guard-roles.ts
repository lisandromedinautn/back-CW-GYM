import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ErrorDominio } from '../dominio/error-dominio.js';

export const CLAVE_ROLES = 'roles';

/** Lo que el guard deja en `request.usuario` para los controladores. */
export interface UsuarioAutenticado {
  sub: string;
  rol: string;
}

export type RequestAutenticado = Request & { usuario: UsuarioAutenticado };

/** El usuario del token, que el guard dejó en el request. Solo en endpoints con @Roles. */
export const UsuarioActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): UsuarioAutenticado =>
    contexto.switchToHttp().getRequest<RequestAutenticado>().usuario,
);

/** Roles que pueden usar el endpoint. Sin este decorador, el endpoint es público. */
export const Roles = (...roles: string[]) => SetMetadata(CLAVE_ROLES, roles);

@Injectable()
export class GuardRoles implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  canActivate(contexto: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!roles) return true;

    const request = contexto.switchToHttp().getRequest<RequestAutenticado>();
    const usuario = this.verificar(request.headers.authorization);
    if (!roles.includes(usuario.rol)) {
      throw new ErrorDominio('RN-IDE-03', 'No tenés permiso para usar esta función', 'prohibido');
    }
    request.usuario = usuario;
    return true;
  }

  private verificar(cabecera: string | undefined): UsuarioAutenticado {
    const [esquema, token] = cabecera?.split(' ') ?? [];
    try {
      if (esquema !== 'Bearer' || !token) throw new Error('sin token');
      return this.jwt.verify<UsuarioAutenticado>(token);
    } catch {
      throw new ErrorDominio('RN-IDE-03', 'Tenés que ingresar al sistema', 'credenciales');
    }
  }
}
