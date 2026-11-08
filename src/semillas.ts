import 'reflect-metadata';
import { Logger, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Semilla } from './compartido/aplicacion/semilla.js';
import { CargarDatasetEjercicios } from './modulos/catalogo/aplicacion/cargar-dataset-ejercicios.caso-uso.js';
import { SembrarAdmin } from './modulos/identidad/aplicacion/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from './modulos/identidad/aplicacion/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from './modulo-raiz.module.js';

/**
 * Punto de entrada de `yarn seed`. Levanta Nest sin servidor HTTP y ejecuta las semillas en orden.
 *
 * Semillas registradas, en el orden en que se ejecutan.
 * - SembrarAdmin (RN-IDE-14): lee ADMIN_EMAIL y ADMIN_PASSWORD del .env.
 * - SembrarUsuarios (RN-IDE-12): 3 profesores y 20 alumnos de prueba con SEMILLA_CONTRASENIA.
 * - CargarDatasetEjercicios (RN-CAT-07, 09): catálogo desde datos/ejercicios-dataset.json.
 */
const SEMILLAS: Type<Semilla>[] = [SembrarAdmin, SembrarUsuarios, CargarDatasetEjercicios];

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
