import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { IngresarAlSistema } from './aplicacion/ingresar-al-sistema.caso-uso.js';
import { SembrarAdmin } from './aplicacion/sembrar-admin.caso-uso.js';
import { EMISOR_TOKENS, type EmisorTokens } from './dominio/emisor-tokens.puerto.js';
import {
  HASHEADOR_CONTRASENIAS,
  type HasheadorContrasenias,
} from './dominio/hasheador-contrasenias.puerto.js';
import {
  REPOSITORIO_USUARIOS,
  type RepositorioUsuarios,
} from './dominio/repositorio-usuarios.puerto.js';
import { EmisorTokensJwt } from './infraestructura/emisor-tokens-jwt.js';
import { HasheadorBcrypt } from './infraestructura/hasheador-bcrypt.js';
import { UsuarioEsquema } from './infraestructura/usuario.esquema.js';
import { RepositorioUsuariosTypeorm } from './infraestructura/usuario.repositorio-typeorm.js';
import { IdentidadControlador } from './presentacion/identidad.controlador.js';

/** Identidad y Vínculos. Los casos de uso no conocen Nest: se arman acá con fábricas. */
@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEsquema])],
  controllers: [IdentidadControlador],
  providers: [
    {
      provide: REPOSITORIO_USUARIOS,
      inject: [getRepositoryToken(UsuarioEsquema)],
      useFactory: (filas: Repository<UsuarioEsquema>) => new RepositorioUsuariosTypeorm(filas),
    },
    { provide: HASHEADOR_CONTRASENIAS, useClass: HasheadorBcrypt },
    {
      provide: EMISOR_TOKENS,
      inject: [JwtService],
      useFactory: (jwt: JwtService) => new EmisorTokensJwt(jwt),
    },
    {
      provide: IngresarAlSistema,
      inject: [REPOSITORIO_USUARIOS, HASHEADOR_CONTRASENIAS, EMISOR_TOKENS],
      useFactory: (u: RepositorioUsuarios, h: HasheadorContrasenias, e: EmisorTokens) =>
        new IngresarAlSistema(u, h, e),
    },
    {
      provide: SembrarAdmin,
      inject: [REPOSITORIO_USUARIOS, HASHEADOR_CONTRASENIAS, ConfigService],
      useFactory: (u: RepositorioUsuarios, h: HasheadorContrasenias, config: ConfigService) =>
        new SembrarAdmin(u, h, {
          email: config.get<string>('ADMIN_EMAIL'),
          contrasenia: config.get<string>('ADMIN_PASSWORD'),
        }),
    },
  ],
})
export class ModuloIdentidad {}
