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

// Fixture de 24 ejercicios (test/datasets/ejercicios-consulta.json). Los filtros se prueban contra
// la base real: el mapeo del dataset (RN-CAT-08) decide tipo, tipo de carga y músculos de cada uno.
describe('GET /catalogo/ejercicios/consulta · filtros', () => {
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
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-CAT-05 · el grupo y el músculo filtran por la lista cerrada', () => {
    it('con grupo=Pecho responde 200 con 2 ejercicios', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?grupo=Pecho');

      expect([respuesta.status, respuesta.body.items?.length]).toEqual([200, 2]);
    });

    it('con musculo=Dorsal responde 200 con 2 ejercicios', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?musculo=Dorsal');

      expect([respuesta.status, respuesta.body.items?.length]).toEqual([200, 2]);
    });
  });

  describe('RN-CAT-02 · el tipo filtra entre "por tiempo" y "por repeticiones"', () => {
    it('con tipo=por tiempo responde 200 con 4 ejercicios', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?tipo=por%20tiempo');

      expect([respuesta.status, respuesta.body.items?.length]).toEqual([200, 4]);
    });
  });

  describe('RN-UI-LIS-02 · los filtros se combinan con Y', () => {
    it('con tipoCarga=Peso Extra y busqueda=PRESS responde 200 con 2 ejercicios', async () => {
      const respuesta = await consultar(
        tokens.Admin as string,
        '?tipoCarga=Peso%20Extra&busqueda=PRESS',
      );

      expect([respuesta.status, respuesta.body.items?.length]).toEqual([200, 2]);
    });
  });

  describe('RN-UI-LIS-01 · la búsqueda trata el % como texto, no como comodín', () => {
    it('con busqueda=% responde 200 con 0 ejercicios', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?busqueda=%25');

      expect([respuesta.status, respuesta.body.items?.length]).toEqual([200, 0]);
    });
  });

  describe('T06 · la página 2 con tamanio 5 trae 5 ejercicios del total de 24', () => {
    it('con tamanio=5 y pagina=2 responde 200 con 5 ejercicios y total 24', async () => {
      const respuesta = await consultar(tokens.Admin as string, '?tamanio=5&pagina=2');

      expect([respuesta.status, respuesta.body.items?.length, respuesta.body.total]).toEqual([
        200, 5, 24,
      ]);
    });
  });
});
