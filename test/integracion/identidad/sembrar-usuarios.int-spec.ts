import type { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

const limpiar = (app: INestApplicationContext) =>
  app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');

// .env.test: SEMILLA_CONTRASENIA=clave-de-semilla
describe('RN-IDE-12 · la semilla de usuarios es idempotente contra la base real', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = await modulo.init();
    await limpiar(app);
  });

  afterAll(async () => {
    await limpiar(app);
    await app.close();
  });

  it('dos ejecuciones dejan 3 profesores, 20 alumnos y 23 usuarios', async () => {
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();

    const [conteo] = await app.get(DataSource).query(
      `SELECT (SELECT count(*) FROM profesores)::int AS profesores,
              (SELECT count(*) FROM alumnos)::int AS alumnos,
              (SELECT count(*) FROM usuarios)::int AS usuarios`,
    );
    expect(conteo).toEqual({ profesores: 3, alumnos: 20, usuarios: 23 });
  });
});
