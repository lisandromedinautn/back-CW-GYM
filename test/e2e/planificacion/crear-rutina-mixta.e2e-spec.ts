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
describe('POST /planificacion/rutinas mixta', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  const ids: Record<string, string> = {};

  const crear = (cuerpo: object) =>
    request(app.getHttpServer())
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${tokenProfesor}`)
      .send(cuerpo);
  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE rutinas CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };
  const bloque = (orden: number) => ({
    orden,
    ejercicioId: ids['lever chest press'],
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 120,
    repeticiones: 10,
  });
  const circuito = (orden: number) => ({
    orden,
    vueltas: 3,
    macropausaSegundos: 90,
    ejercicios: [
      { ejercicioId: ids['lever chest press'], repeticiones: 10 },
      { ejercicioId: ids['weighted front plank'], segundos: 45 },
    ],
  });

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

  describe('RN-PLAN-01 · el Profesor crea una rutina mixta con bloques y circuitos en orden', () => {
    it('circuito (1) y bloque (2) responde 201 con tipo Mixta y el orden de cada uno', async () => {
      const respuesta = await crear({ bloques: [bloque(2)], circuitos: [circuito(1)] });

      expect([
        respuesta.status,
        respuesta.body.tipo,
        respuesta.body.circuitos.map((c: { orden: number }) => c.orden),
        respuesta.body.bloques.map((b: { orden: number }) => b.orden),
      ]).toEqual([201, 'Mixta', [1], [2]]);
    });

    it('GET /planificacion/rutinas devuelve la rutina con el mismo orden que se guardó', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/planificacion/rutinas')
        .set('Authorization', `Bearer ${tokenProfesor}`);
      const [rutina] = respuesta.body.items;

      expect([
        rutina.tipo,
        rutina.circuitos.map((c: { orden: number }) => c.orden),
        rutina.bloques.map((b: { orden: number }) => b.orden),
      ]).toEqual(['Mixta', [1], [2]]);
    });

    it('con órdenes repetidos (1 y 1) responde 400 RN-PLAN-01', async () => {
      const respuesta = await crear({ bloques: [bloque(1)], circuitos: [circuito(1)] });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-01']);
    });
  });
});
