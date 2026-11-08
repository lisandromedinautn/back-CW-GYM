import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/fuente-dataset-ejercicios.archivo.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

// Fixture: lever chest press (por repeticiones, Peso Extra), 3/4 sit-up (por repeticiones, Peso Corporal).
describe('POST /planificacion/rutinas', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const crear = (token: string, bloques: object[]) =>
    request(app.getHttpServer())
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloques });
  const bloque = (ejercicioId: string, cambios: object = {}) => ({
    ejercicioId,
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 120,
    repeticiones: 10,
    ...cambios,
  });
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

  describe('RN-PLAN-01 · el Profesor crea una rutina por bloques', () => {
    it('con un bloque de lever chest press responde 201 con id y tipo Bloques', async () => {
      const respuesta = await crear(tokens.Profesor as string, [
        bloque(ids['lever chest press'] as string),
      ]);

      expect([respuesta.status, typeof respuesta.body.id, respuesta.body.tipo]).toEqual([
        201,
        'string',
        'Bloques',
      ]);
    });
  });

  describe('RN-PLAN-06 · los ejercicios tienen que existir en el catálogo', () => {
    it('con un ejercicio inexistente responde 404 RN-PLAN-06', async () => {
      const respuesta = await crear(tokens.Profesor as string, [
        bloque('00000000-0000-4000-8000-000000000000'),
      ]);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([404, 'RN-PLAN-06']);
    });
  });

  describe('RN-PLAN-05 · el peso se indica solo si la carga incluye Peso Extra', () => {
    it('con 5 kg en 3/4 sit-up (Peso Corporal) responde 400 RN-PLAN-05', async () => {
      const respuesta = await crear(tokens.Profesor as string, [
        bloque(ids['3/4 sit-up'] as string, { pesoKg: 5 }),
      ]);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-05']);
    });
  });

  describe('RN-IDE-03 · solo el Profesor crea rutinas', () => {
    it.each(['Admin', 'Alumno'])('con el token de %s responde 403 RN-IDE-03', async (rol) => {
      const respuesta = await crear(tokens[rol] as string, [
        bloque(ids['lever chest press'] as string),
      ]);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
