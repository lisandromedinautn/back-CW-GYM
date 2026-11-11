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

// Fixture de 24 ejercicios distintos (test/datasets/ejercicios-consulta.json), para que la paginación
// de 20 tenga una segunda página. Sin filtros: total 24.
describe('GET /catalogo/ejercicios/consulta', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const consultar = (token: string, query = '') =>
    request(app.getHttpServer())
      .get(`/catalogo/ejercicios/consulta${query}`)
      .set('Authorization', `Bearer ${token}`);
  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-consulta.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    tokens.Admin = await ingresar('admin@test.local', 'clave-de-test');
    tokens.Alumno = await ingresar('alumno01@cwgym.test', 'clave-de-semilla');
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('T06 · la consulta pagina por 5, 10, 20, 50 o 100; la página arranca en 1', () => {
    it('sin filtros con tamanio=20 responde 200 con 20 ejercicios, página 1 y total 24', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?tamanio=20');

      expect([
        respuesta.status,
        respuesta.body.items?.length,
        respuesta.body.pagina,
        respuesta.body.tamanio,
        respuesta.body.total,
      ]).toEqual([200, 20, 1, 20, 24]);
    });

    it('con tamanio=7 responde 400', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?tamanio=7');

      expect(respuesta.status).toBe(400);
    });

    it('con pagina=0 responde 400', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?pagina=0');

      expect(respuesta.status).toBe(400);
    });
  });

  describe('RN-CAT-05 · el grupo muscular se elige de la lista cerrada', () => {
    it('con grupo=Inventado responde 400', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?grupo=Inventado');

      expect(respuesta.status).toBe(400);
    });
  });

  describe('RN-IDE-03 · la consulta del catálogo la usan el Admin y el Profesor', () => {
    it('con el token de un Alumno responde 403 RN-IDE-03', async () => {
      const respuesta = await consultar(tokens.Alumno as string);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
