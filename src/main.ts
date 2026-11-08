import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { configurarAplicacion } from './configurar-aplicacion.js';
import { ModuloRaiz } from './modulo-raiz.module.js';

async function arrancar(): Promise<void> {
  const app = configurarAplicacion(await NestFactory.create(ModuloRaiz));
  const config = app.get(ConfigService);

  app.enableCors({ origin: config.getOrThrow<string>('URL_FRONT') });

  await app.listen(Number(config.get<string>('PUERTO') ?? 3000));
}

await arrancar();
