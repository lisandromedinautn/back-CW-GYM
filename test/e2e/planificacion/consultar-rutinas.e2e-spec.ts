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
// T06 (paginación): tamaños 5, 10, 20, 50 o 100; página desde 1. Validación del DTO, sin código RN.
describe('GET /planificacion/rutinas', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const consultar = (token: string, query = '') =>
    request(app.getHttpServer())
      .get(`/planificacion/rutinas${query}`)
      .set('Authorization', `Bearer ${token}`);
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
    await crear(tokens.Profesor as string, 'Pecho');
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('T06 · paginación: el tamaño es 5, 10, 20, 50 o 100, y la página arranca en 1', () => {
    it('con tamanio=7 responde 400', async () => {
      const respuesta = await consultar(tokens.Profesor as string, '?tamanio=7');

      expect(respuesta.status).toBe(400);
    });

    it('con pagina=0 responde 400', async () => {
      const respuesta = await consultar(tokens.Profesor as string, '?pagina=0');

      expect(respuesta.status).toBe(400);
    });

    it('sin parámetros responde pagina 1 y tamanio 10, con items y total', async () => {
      const respuesta = await consultar(tokens.Profesor as string);

      expect([respuesta.status, respuesta.body]).toEqual([
        200,
        {
          items: [expect.objectContaining({ nombre: 'Pecho' })],
          total: 1,
          pagina: 1,
          tamanio: 10,
        },
      ]);
    });
  });

  describe('RN-IDE-03 · solo el Profesor consulta sus rutinas', () => {
    it('con el token de Alumno responde 403 RN-IDE-03', async () => {
      const respuesta = await consultar(tokens.Alumno as string);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
