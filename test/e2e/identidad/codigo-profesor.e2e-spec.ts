import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

// .env.test: admin@test.local / clave-de-test; semilla: profesor01@cwgym.test y alumno01@cwgym.test con clave-de-semilla
describe('/identidad/profesores/codigo', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const limpiar = () =>
    app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    tokens.admin = await ingresar('admin@test.local', 'clave-de-test');
    tokens.profesor = await ingresar('profesor01@cwgym.test', 'clave-de-semilla');
    tokens.alumno = await ingresar('alumno01@cwgym.test', 'clave-de-semilla');
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-IDE-08 · el profesor genera su código y lo consulta', () => {
    it('antes de generarlo, GET responde 200 con codigo null', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokens.profesor}`);

      expect([respuesta.status, respuesta.body]).toEqual([200, { codigo: null }]);
    });

    it('POST responde 201 con un código de 6 caracteres que después devuelve el GET', async () => {
      const generado = await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokens.profesor}`);
      const consultado = await request(app.getHttpServer())
        .get('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokens.profesor}`);

      expect([generado.status, /^[A-Z2-9]{6}$/.test(generado.body.codigo)]).toEqual([201, true]);
      expect(consultado.body.codigo).toBe(generado.body.codigo);
    });
  });

  describe('RN-IDE-03 · solo el Profesor genera su código', () => {
    it.each(['admin', 'alumno'])('con el token de %s responde 403 RN-IDE-03', async (quien) => {
      const respuesta = await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokens[quien]}`);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });
});
