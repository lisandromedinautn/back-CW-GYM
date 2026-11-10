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

// Fixture: lever chest press (por repeticiones, Peso Extra), weighted front plank (por tiempo).
describe('POST /planificacion/rutinas con circuitos', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  const ids: Record<string, string> = {};

  const crear = (circuitos: object[]) =>
    request(app.getHttpServer())
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${tokenProfesor}`)
      .send({ circuitos });
  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE rutinas CASCADE');
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
    tokenProfesor = (
      await request(app.getHttpServer())
        .post('/identidad/ingreso')
        .send({ email: 'profesor01@cwgym.test', contrasenia: 'clave-de-semilla' })
    ).body.token;
    const catalogo = await request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${tokenProfesor}`);
    for (const ejercicio of catalogo.body as { id: string; nombre: string }[]) {
      ids[ejercicio.nombre] = ejercicio.id;
    }
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-PLAN-01, 03 · el Profesor crea una rutina por circuitos', () => {
    it('un circuito de lever chest press y weighted front plank responde 201 con tipo Circuitos', async () => {
      const respuesta = await crear([
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [
            { ejercicioId: ids['lever chest press'], repeticiones: 10 },
            { ejercicioId: ids['weighted front plank'], segundos: 45 },
          ],
        },
      ]);

      expect([respuesta.status, respuesta.body.tipo]).toEqual([201, 'Circuitos']);
    });
  });

  describe('RN-PLAN-03 · un circuito tiene 2 o más ejercicios', () => {
    it('un circuito de solo lever chest press responde 400 RN-PLAN-03', async () => {
      const respuesta = await crear([
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [{ ejercicioId: ids['lever chest press'], repeticiones: 10 }],
        },
      ]);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-03']);
    });
  });
});
