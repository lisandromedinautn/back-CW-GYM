import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloCompartido } from './compartido/compartido.module.js';
import { ModuloIdentidad } from './modulos/identidad/identidad.module.js';

/**
 * Módulo raíz: carga las variables de entorno y abre la conexión a PostgreSQL.
 * Cada módulo de dominio (identidad, catalogo, planificacion, entrenamiento) se importa acá
 * a medida que se implementa. Las entidades de TypeORM se registran solas (autoLoadEntities)
 * cuando un módulo las declara con TypeOrmModule.forFeature.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Vitest define NODE_ENV=test: los tests usan la base dockerizada de test.
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('BD_SERVIDOR'),
        port: Number(config.getOrThrow<string>('BD_PUERTO')),
        username: config.getOrThrow<string>('BD_USUARIO'),
        password: config.getOrThrow<string>('BD_CLAVE'),
        database: config.getOrThrow<string>('BD_NOMBRE'),
        autoLoadEntities: true,
        synchronize: config.get<string>('BD_SINCRONIZAR') === 'true',
      }),
    }),
    ModuloCompartido,
    ModuloIdentidad,
  ],
})
export class ModuloRaiz {}
