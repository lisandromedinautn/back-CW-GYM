import { Module } from '@nestjs/common';
import {
  PUBLICADOR_EVENTOS,
  type PublicadorEventos,
} from '../../compartido/dominio/publicador-eventos.puerto.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ConsultarCodigoProfesor } from './aplicacion/consultar-codigo-profesor.caso-uso.js';
import { DarAltaProfesor } from './aplicacion/dar-alta-profesor.caso-uso.js';
import { GenerarCodigoProfesor } from './aplicacion/generar-codigo-profesor.caso-uso.js';
import { VincularAlumno } from './aplicacion/vincular-alumno.caso-uso.js';
import { IngresarAlSistema } from './aplicacion/ingresar-al-sistema.caso-uso.js';
import { SembrarAdmin } from './aplicacion/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from './aplicacion/sembrar-usuarios.caso-uso.js';
import { EMISOR_TOKENS, type EmisorTokens } from './dominio/emisor-tokens.puerto.js';
import { GENERADOR_CODIGOS, type GeneradorCodigos } from './dominio/generador-codigos.puerto.js';
import {
  HASHEADOR_CONTRASENIAS,
  type HasheadorContrasenias,
} from './dominio/hasheador-contrasenias.puerto.js';
import {
  REPOSITORIO_ALUMNOS,
  type RepositorioAlumnos,
} from './dominio/repositorio-alumnos.puerto.js';
import {
  REPOSITORIO_PROFESORES,
  type RepositorioProfesores,
} from './dominio/repositorio-profesores.puerto.js';
import {
  REPOSITORIO_USUARIOS,
  type RepositorioUsuarios,
} from './dominio/repositorio-usuarios.puerto.js';
import { AlumnoEsquema } from './infraestructura/alumno.esquema.js';
import { RepositorioAlumnosTypeorm } from './infraestructura/alumno.repositorio-typeorm.js';
import { EmisorTokensJwt } from './infraestructura/emisor-tokens-jwt.js';
import { GeneradorCodigosAleatorio } from './infraestructura/generador-codigos-aleatorio.js';
import { HasheadorBcrypt } from './infraestructura/hasheador-bcrypt.js';
import { ProfesorEsquema } from './infraestructura/profesor.esquema.js';
import { RepositorioProfesoresTypeorm } from './infraestructura/profesor.repositorio-typeorm.js';
import { UsuarioEsquema } from './infraestructura/usuario.esquema.js';
import { RepositorioUsuariosTypeorm } from './infraestructura/usuario.repositorio-typeorm.js';
import { IdentidadControlador } from './presentacion/identidad.controlador.js';

/** Identidad y Vínculos. Los casos de uso no conocen Nest: se arman acá con fábricas. */
@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEsquema, ProfesorEsquema, AlumnoEsquema])],
  controllers: [IdentidadControlador],
  providers: [
    {
      provide: REPOSITORIO_USUARIOS,
      inject: [getRepositoryToken(UsuarioEsquema)],
      useFactory: (filas: Repository<UsuarioEsquema>) => new RepositorioUsuariosTypeorm(filas),
    },
    {
      provide: REPOSITORIO_PROFESORES,
      inject: [getRepositoryToken(ProfesorEsquema)],
      useFactory: (filas: Repository<ProfesorEsquema>) => new RepositorioProfesoresTypeorm(filas),
    },
    {
      provide: REPOSITORIO_ALUMNOS,
      inject: [getRepositoryToken(AlumnoEsquema)],
      useFactory: (filas: Repository<AlumnoEsquema>) => new RepositorioAlumnosTypeorm(filas),
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
      provide: DarAltaProfesor,
      inject: [
        REPOSITORIO_USUARIOS,
        REPOSITORIO_PROFESORES,
        REPOSITORIO_ALUMNOS,
        HASHEADOR_CONTRASENIAS,
      ],
      useFactory: (
        u: RepositorioUsuarios,
        p: RepositorioProfesores,
        a: RepositorioAlumnos,
        h: HasheadorContrasenias,
      ) => new DarAltaProfesor(u, p, a, h),
    },
    { provide: GENERADOR_CODIGOS, useClass: GeneradorCodigosAleatorio },
    {
      provide: GenerarCodigoProfesor,
      inject: [REPOSITORIO_PROFESORES, GENERADOR_CODIGOS],
      useFactory: (p: RepositorioProfesores, g: GeneradorCodigos) =>
        new GenerarCodigoProfesor(p, g),
    },
    {
      provide: ConsultarCodigoProfesor,
      inject: [REPOSITORIO_PROFESORES],
      useFactory: (p: RepositorioProfesores) => new ConsultarCodigoProfesor(p),
    },
    {
      provide: VincularAlumno,
      inject: [REPOSITORIO_ALUMNOS, REPOSITORIO_PROFESORES, PUBLICADOR_EVENTOS],
      useFactory: (a: RepositorioAlumnos, p: RepositorioProfesores, e: PublicadorEventos) =>
        new VincularAlumno(a, p, e),
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
    {
      provide: SembrarUsuarios,
      inject: [
        REPOSITORIO_USUARIOS,
        REPOSITORIO_PROFESORES,
        REPOSITORIO_ALUMNOS,
        HASHEADOR_CONTRASENIAS,
        ConfigService,
      ],
      useFactory: (
        u: RepositorioUsuarios,
        p: RepositorioProfesores,
        a: RepositorioAlumnos,
        h: HasheadorContrasenias,
        config: ConfigService,
      ) =>
        new SembrarUsuarios(u, p, a, h, {
          contrasenia: config.get<string>('SEMILLA_CONTRASENIA'),
        }),
    },
  ],
})
export class ModuloIdentidad {}
