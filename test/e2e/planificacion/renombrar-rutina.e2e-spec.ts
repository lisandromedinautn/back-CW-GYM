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

// Fixture: lever chest press (por repeticiones, Peso Extra).
// Semilla: profesor01@cwgym.test (Laura) y profesor02@cwgym.test (Diego), clave-de-semilla.
describe('PATCH /planificacion/rutinas/:id/nombre', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const crear = (token: string, nombre: string) =>
    request(app.getHttpServer())
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre,
        bloques: [
          {
            ejercicioId: ids['lever chest press'],
            series: 3,
            micropausaSegundos: 60,
            macropausaSegundos: 120,
            repeticiones: 10,
          },
        ],
      });
  const renombrar = (token: string, id: string, nombre: string) =>
    request(app.getHttpServer())
      .patch(`/planificacion/rutinas/${id}/nombre`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre });
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
    tokens.Admin = await ingresar('admin@test.local', 'clave-de-test');
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

  describe('RN-PLAN-21 · el profesor renombra su rutina', () => {
    it("PATCH con 'Piernas' responde 200 y después el listado la muestra como 'Piernas'", async () => {
      const creada = await crear(tokens.Profesor as string, 'Pecho');
      const patch = await renombrar(tokens.Profesor as string, creada.body.id, 'Piernas');
      const listado = await request(app.getHttpServer())
        .get('/planificacion/rutinas')
        .set('Authorization', `Bearer ${tokens.Profesor}`);

      expect({
        status: patch.status,
        nombres: ((listado.body.items ?? []) as { nombre: string }[]).map(
          (rutina) => rutina.nombre,
        ),
      }).toEqual({ status: 200, nombres: ['Piernas'] });
    });
  });

  describe('RN-PLAN-21 · el nombre tiene como máximo 60 caracteres', () => {
    it('con 61 caracteres responde 400 RN-PLAN-21', async () => {
      const creada = await crear(tokens.Profesor as string, 'Pecho');
      const respuesta = await renombrar(tokens.Profesor as string, creada.body.id, 'a'.repeat(61));

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-21']);
    });
  });

  describe('RN-PLAN-08 · un profesor solo edita sus propias rutinas', () => {
    it('renombrar una rutina de otro profesor responde 404 RN-PLAN-08', async () => {
      const deOtro = await crear(tokens.OtroProfesor as string, 'Pecho');
      const respuesta = await renombrar(tokens.Profesor as string, deOtro.body.id, 'Piernas');

      expect([respuesta.status, respuesta.body.codigo]).toEqual([404, 'RN-PLAN-08']);
    });
  });

  describe('RN-IDE-03 · solo el Profesor renombra rutinas', () => {
    it('con el token de Alumno responde 403 RN-IDE-03', async () => {
      const creada = await crear(tokens.Profesor as string, 'Pecho');
      const respuesta = await renombrar(tokens.Alumno as string, creada.body.id, 'Piernas');

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
