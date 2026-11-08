import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

const laura = {
  nombre: 'Laura',
  apellido: 'Gómez',
  tipoDocumento: 'DNI',
  numeroDocumento: '30111222',
  legajo: 'P-001',
  email: 'laura@test.local',
  contrasenia: 'Inicial123',
};

// .env.test: ADMIN_EMAIL=admin@test.local, ADMIN_PASSWORD=clave-de-test
describe('POST /identidad/profesores', () => {
  let app: INestApplication;
  let tokenAdmin: string;

  const ingresar = async (email: string, contrasenia: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/identidad/ingreso')
      .send({ email, contrasenia });
    return respuesta.body.token;
  };
  const limpiar = () =>
    app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    tokenAdmin = await ingresar('admin@test.local', 'clave-de-test');
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-IDE-04 · solo el Admin da de alta profesores con su legajo', () => {
    it('el Admin da de alta a Laura (P-001): 201 con el legajo', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/identidad/profesores')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(laura);

      expect([respuesta.status, respuesta.body.legajo, typeof respuesta.body.id]).toEqual([
        201,
        'P-001',
        'string',
      ]);
    });

    it('con el legajo P-001 repetido responde 409 RN-IDE-04', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/identidad/profesores')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...laura, numeroDocumento: '30999999', email: 'otra@test.local' });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([409, 'RN-IDE-04']);
    });
  });

  describe('RN-IDE-03 · solo el rol Admin accede: sin token 401, otro rol 403', () => {
    it('sin token responde 401 RN-IDE-03', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/identidad/profesores')
        .send({ ...laura, legajo: 'P-002' });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([401, 'RN-IDE-03']);
    });

    it('con el token de la profesora Laura responde 403 RN-IDE-03', async () => {
      const tokenProfesor = await ingresar('laura@test.local', 'Inicial123');

      const respuesta = await request(app.getHttpServer())
        .post('/identidad/profesores')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send({ ...laura, legajo: 'P-002' });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
