import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

// Casos confirmados por Martina el 24/11/2026 (US06, edición).
// Fixture: lever chest press (por repeticiones) y weighted front plank (por tiempo).
// Semilla: profesor01@cwgym.test (Laura), profesor02@cwgym.test (Diego) y alumno01, clave-de-semilla.
describe('GET y PUT /planificacion/rutinas/:id', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const bloque = (nombre: string, series: number, objetivo: Record<string, number>) => ({
    ejercicioId: ids[nombre],
    series,
    micropausaSegundos: 60,
    macropausaSegundos: 90,
    ...objetivo,
  });
  const crear = (token: string) =>
    request(app.getHttpServer())
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloques: [bloque('lever chest press', 3, { repeticiones: 10 })] });
  const editar = (token: string, id: string, cuerpo: object) =>
    request(app.getHttpServer())
      .put(`/planificacion/rutinas/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo);
  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE bloques_rutina, rutinas CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    tokens.Profesor = await ingresar('profesor01@cwgym.test', 'clave-de-semilla');
    tokens.OtroProfesor = await ingresar('profesor02@cwgym.test', 'clave-de-semilla');
    tokens.Alumno = await ingresar('alumno01@cwgym.test', 'clave-de-semilla');
    const catalogo = await request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${tokens.Profesor}`);
    for (const ejercicio of catalogo.body as { id: string; nombre: string }[]) {
      ids[ejercicio.nombre] = ejercicio.id;
    }
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-PLAN-07 · una rutina se puede editar siempre', () => {
    it('PUT responde 200 y el GET devuelve los bloques nuevos, sin el que se quitó', async () => {
      const creada = await crear(tokens.Profesor as string);
      const put = await editar(tokens.Profesor as string, creada.body.id, {
        bloques: [
          bloque('weighted front plank', 3, { segundos: 30 }),
          bloque('lever chest press', 4, { repeticiones: 8 }),
        ],
      });
      const get = await request(app.getHttpServer())
        .get(`/planificacion/rutinas/${creada.body.id}`)
        .set('Authorization', `Bearer ${tokens.Profesor}`);

      expect({
        put: put.status,
        get: get.status,
        bloques: ((get.body.bloques ?? []) as Record<string, unknown>[]).map((b) => [
          b.orden,
          b.series,
          b.repeticiones,
          b.segundos,
        ]),
      }).toEqual({
        put: 200,
        get: 200,
        bloques: [
          [1, 3, null, 30],
          [2, 4, 8, null],
        ],
      });
    });
  });

  describe('RN-PLAN-08 · un profesor solo ve y edita sus propias rutinas', () => {
    it('PUT sobre una rutina de otro profesor responde 404 RN-PLAN-08', async () => {
      const deOtro = await crear(tokens.OtroProfesor as string);
      const respuesta = await editar(tokens.Profesor as string, deOtro.body.id, {
        bloques: [bloque('lever chest press', 4, { repeticiones: 8 })],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([404, 'RN-PLAN-08']);
    });

    it('GET de una rutina de otro profesor responde 404 RN-PLAN-08', async () => {
      const deOtro = await crear(tokens.OtroProfesor as string);
      const respuesta = await request(app.getHttpServer())
        .get(`/planificacion/rutinas/${deOtro.body.id}`)
        .set('Authorization', `Bearer ${tokens.Profesor}`);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([404, 'RN-PLAN-08']);
    });
  });

  describe('RN-IDE-03 · solo el Profesor edita rutinas', () => {
    it('PUT con el token de Alumno responde 403 RN-IDE-03', async () => {
      const creada = await crear(tokens.Profesor as string);
      const respuesta = await editar(tokens.Alumno as string, creada.body.id, {
        bloques: [bloque('lever chest press', 4, { repeticiones: 8 })],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
