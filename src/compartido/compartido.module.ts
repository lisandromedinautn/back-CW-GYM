import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PUBLICADOR_EVENTOS } from './dominio/publicador-eventos/publicador-eventos.puerto.js';
import { SUSCRIPTOR_EVENTOS } from './dominio/publicador-eventos/suscriptor-eventos.puerto.js';
import { PublicadorEventosEnProceso } from './infraestructura/publicador-eventos/publicador-eventos-en-proceso.js';
import { FiltroErrorDominio } from './presentacion/filtro-error-dominio/filtro-error-dominio.js';
import { GuardRoles } from './presentacion/guard-roles/guard-roles.js';

/** Kernel compartido: JWT, guard de roles (RN-IDE-03) y traducción de errores de dominio. */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRETO'),
        signOptions: { expiresIn: config.get('JWT_EXPIRACION') ?? '8h' },
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: GuardRoles },
    { provide: APP_FILTER, useClass: FiltroErrorDominio },
    PublicadorEventosEnProceso,
    { provide: PUBLICADOR_EVENTOS, useExisting: PublicadorEventosEnProceso },
    { provide: SUSCRIPTOR_EVENTOS, useExisting: PublicadorEventosEnProceso },
  ],
  exports: [JwtModule, PUBLICADOR_EVENTOS, SUSCRIPTOR_EVENTOS],
})
export class ModuloCompartido {}
