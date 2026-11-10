import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

// .env.test: ADMIN_EMAIL=admin@test.local, ADMIN_PASSWORD=clave-de-test
describe('RN-IDE-01 · POST /identidad/ingreso: JWT con el rol o 401 sin decir qué dato falló', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await app.get(DataSource).query('TRUNCATE TABLE usuarios CASCADE');
    await app.get(SembrarAdmin).ejecutar();
  });

  afterAll(async () => {
    await app.get(DataSource).query('TRUNCATE TABLE usuarios CASCADE');
    await app.close();
  });

  it('con admin@test.local / clave-de-test responde 200 con un token y el rol Admin', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/identidad/ingreso')
      .send({ email: 'admin@test.local', contrasenia: 'clave-de-test' });

    expect([respuesta.status, respuesta.body.rol, typeof respuesta.body.token]).toEqual([
      200,
      'Admin',
      'string',
    ]);
  });

  it('con la contraseña incorrecta responde 401 con RN-IDE-01 "Email o contraseña incorrectos"', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/identidad/ingreso')
      .send({ email: 'admin@test.local', contrasenia: 'otra-clave' });

    expect([respuesta.status, respuesta.body]).toEqual([
      401,
      { codigo: 'RN-IDE-01', mensaje: 'Email o contraseña incorrectos' },
    ]);
  });

  it('con un email inexistente responde exactamente lo mismo', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/identidad/ingreso')
      .send({ email: 'nadie@test.local', contrasenia: 'clave-de-test' });

    expect([respuesta.status, respuesta.body]).toEqual([
      401,
      { codigo: 'RN-IDE-01', mensaje: 'Email o contraseña incorrectos' },
    ]);
  });
});
