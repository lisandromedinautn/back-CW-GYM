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

// Fixture de 5 registros con "lever chest press" repetido: quedan 4 ejercicios (T01).
describe('GET /catalogo/ejercicios', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;
  const listar = (token: string) =>
    request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${token}`);
  const limpiar = async () => {
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
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-IDE-03 · el catálogo lo consultan el Admin y el Profesor', () => {
    it.each(['Admin', 'Profesor'])(
      'con el token de %s responde 200 con los 4 ejercicios en orden alfabético',
      async (rol) => {
        const respuesta = await listar(tokens[rol] as string);

        expect([respuesta.status, respuesta.body.map((e: { nombre: string }) => e.nombre)]).toEqual(
          [
            200,
            ['3/4 sit-up', 'kettlebell hang clean', 'lever chest press', 'weighted front plank'],
          ],
        );
      },
    );

    it('con el token de un Alumno responde 403 RN-IDE-03', async () => {
      const respuesta = await listar(tokens.Alumno as string);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });

  describe('RN-CAT-01, 05 · cada ejercicio trae sus datos y el grupo muscular derivado', () => {
    it('weighted front plank: por tiempo, Peso Corporal + Peso Extra, Abdominales (Core), Deltoides, factor 100', async () => {
      const respuesta = await listar(tokens.Admin as string);
      const plancha = respuesta.body.find(
        (e: { nombre: string }) => e.nombre === 'weighted front plank',
      );

      expect({
        ...plancha,
        id: typeof plancha.id,
        descripcion: typeof plancha.descripcion,
      }).toEqual({
        id: 'string',
        nombre: 'weighted front plank',
        descripcion: 'string',
        tipo: 'por tiempo',
        tipoCarga: 'Peso Corporal + Peso Extra',
        factorPesoCorporal: 100,
        musculoPrincipal: 'Abdominales',
        grupoMuscular: 'Core',
        musculoSecundario: 'Deltoides',
        urlGif:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2135-VBAWRPG.gif',
        atribucion: '© Gym visual — https://gymvisual.com/',
      });
    });
  });
});
