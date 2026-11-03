import 'reflect-metadata';
import { Logger, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Semilla } from './compartido/aplicacion/semilla.js';
import { ModuloRaiz } from './modulo-raiz.module.js';

/**
 * Punto de entrada de `yarn seed`. Levanta Nest sin servidor HTTP y ejecuta las semillas en orden.
 *
 * Semillas registradas, en el orden en que se ejecutan. US00 agrega la primera: SembrarAdmin
 * (RN-IDE-14), que lee ADMIN_EMAIL y ADMIN_PASSWORD del .env.
 */
const SEMILLAS: Type<Semilla>[] = [];

const logger = new Logger('Semillas');

async function sembrar(): Promise<void> {
  const app = await NestFactory.createApplicationContext(ModuloRaiz, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    if (SEMILLAS.length === 0) {
      logger.warn('Todavía no hay semillas registradas.');
    }
    for (const clase of SEMILLAS) {
      const semilla = app.get(clase);
      logger.log(`Ejecutando ${semilla.nombre}…`);
      await semilla.ejecutar();
    }
    logger.log('Semillas terminadas.');
  } finally {
    await app.close();
  }
}

await sembrar().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
