import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

// Semilla: profesor01@cwgym.test es Laura Gómez; alumno01@cwgym.test, Martín Pérez (clave-de-semilla).
describe('POST /identidad/alumnos/vinculo', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenAlumno: string;
  let codigo: string;

  const ingresar = async (email: string): Promise<string> =>
    (
      await request(app.getHttpServer())
        .post('/identidad/ingreso')
        .send({ email, contrasenia: 'clave-de-semilla' })
    ).body.token;
  const vincular = (token: string, codigoIngresado: string) =>
    request(app.getHttpServer())
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: codigoIngresado });
  const limpiar = () =>
    app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarUsuarios).ejecutar();
    tokenProfesor = await ingresar('profesor01@cwgym.test');
    tokenAlumno = await ingresar('alumno01@cwgym.test');
    codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesor}`)
    ).body.codigo;
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-IDE-03 · solo el Alumno se vincula', () => {
    it('con el token de la profesora responde 403 RN-IDE-03', async () => {
      const respuesta = await vincular(tokenProfesor, codigo);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });

  describe('RN-IDE-11 · un código inexistente no vincula', () => {
    it('con NOEXIS responde 400 RN-IDE-11', async () => {
      const respuesta = await vincular(tokenAlumno, 'NOEXIS');

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-IDE-11']);
    });
  });

  describe('RN-IDE-09 · con el código de Laura, Martín queda vinculado a ella', () => {
    it('responde 200 con el nombre de la profesora', async () => {
      const respuesta = await vincular(tokenAlumno, codigo);

      expect([respuesta.status, respuesta.body]).toEqual([
        200,
        { profesor: { nombre: 'Laura', apellido: 'Gómez' } },
      ]);
    });
  });

  describe('RN-IDE-10 · un alumno que ya tiene profesor no se vincula de nuevo', () => {
    it('la segunda vez responde 409 RN-IDE-10', async () => {
      const respuesta = await vincular(tokenAlumno, codigo);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([409, 'RN-IDE-10']);
    });
  });
});
