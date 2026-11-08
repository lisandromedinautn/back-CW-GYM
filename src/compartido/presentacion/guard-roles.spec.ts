import { Controller, Get, type INestApplication } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FiltroErrorDominio } from './filtro-error-dominio.js';
import { GuardRoles, Roles } from './guard-roles.js';

@Controller('prueba')
class ControladorDePrueba {
  @Get('solo-admin')
  @Roles('Admin')
  soloAdmin() {
    return { ok: true };
  }
}

describe('RN-IDE-03 · un usuario solo accede a las funciones de su rol: sin token 401, otro rol 403', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secreto-de-prueba' })],
      controllers: [ControladorDePrueba],
      providers: [
        { provide: APP_GUARD, useClass: GuardRoles },
        { provide: APP_FILTER, useClass: FiltroErrorDominio },
      ],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
    jwt = modulo.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('sin token responde 401 con el código RN-IDE-03', async () => {
    const respuesta = await request(app.getHttpServer()).get('/prueba/solo-admin');

    expect([respuesta.status, respuesta.body.codigo]).toEqual([401, 'RN-IDE-03']);
  });

  it('con un token inválido responde 401', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/prueba/solo-admin')
      .set('Authorization', 'Bearer no-es-un-jwt');

    expect(respuesta.status).toBe(401);
  });

  it('con un token de Profesor en una ruta de Admin responde 403 con el código RN-IDE-03', async () => {
    const token = jwt.sign({ sub: 'p-1', rol: 'Profesor' });

    const respuesta = await request(app.getHttpServer())
      .get('/prueba/solo-admin')
      .set('Authorization', `Bearer ${token}`);

    expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
  });

  it('con un token de Admin deja pasar (200)', async () => {
    const token = jwt.sign({ sub: 'a-1', rol: 'Admin' });

    const respuesta = await request(app.getHttpServer())
      .get('/prueba/solo-admin')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
  });
});
