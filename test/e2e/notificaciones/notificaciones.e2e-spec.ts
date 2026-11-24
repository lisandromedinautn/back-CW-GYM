import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';

describe('RN-NOT-01, 02, 03, 04 · notificación, bandeja y lectura', () => {
  let app: INestApplication;
  let profesor01: string;
  let profesor02: string;
  let alumno01: string;
  let alumno02: string;
  const ahora = new Date('2026-11-20T10:00:00.000Z');
  const api = () => request(app.getHttpServer());
  const con = (token: string) => ({ Authorization: `Bearer ${token}` });
  const ingresar = async (email: string): Promise<string> =>
    (
      await api()
        .post('/identidad/ingreso')
        .send({ email, contrasenia: 'clave-de-semilla' })
        .expect(200)
    ).body.token;
  const vincular = async (alumno: string): Promise<void> => {
    const {
      body: { codigo },
    } = await api().post('/identidad/profesores/codigo').set(con(profesor01)).expect(201);
    await api().post('/identidad/alumnos/vinculo').set(con(alumno)).send({ codigo }).expect(200);
  };
  const entrenar = async (alumno: string, series: object[]): Promise<void> => {
    const { body } = await api().post('/entrenamiento/entrenamientos').set(con(alumno)).expect(201);
    for (const serie of series) {
      await api()
        .post(`/entrenamiento/entrenamientos/${body.id}/series`)
        .set(con(alumno))
        .send(serie)
        .expect(201);
    }
    await api()
      .post(`/entrenamiento/entrenamientos/${body.id}/finalizacion`)
      .set(con(alumno))
      .expect(201);
  };
  const serie = (numero: number, repeticiones: number, pesoKg: number) => ({
    orden: 1,
    numero,
    repeticiones,
    pesoKg,
  });

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(Reloj)
      .useValue({ ahora: () => ahora })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    const bd = app.get(DataSource);
    await limpiar(bd);
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    profesor01 = await ingresar('profesor01@cwgym.test');
    profesor02 = await ingresar('profesor02@cwgym.test');
    alumno01 = await ingresar('alumno01@cwgym.test');
    alumno02 = await ingresar('alumno02@cwgym.test');
    await vincular(alumno01);
    await vincular(alumno02);
    const { body: alumnos } = await api()
      .get('/identidad/alumnos')
      .set(con(profesor01))
      .expect(200);
    const ids = (alumnos as { id: string }[]).map((a) => a.id);
    await bd.query('UPDATE alumnos SET peso_kg = 80 WHERE id = ANY($1)', [ids]);
    const { body: ejercicios } = await api()
      .get('/catalogo/ejercicios')
      .set(con(profesor01))
      .expect(200);
    const press = (ejercicios as { id: string; nombre: string }[]).find(
      (e) => e.nombre === 'lever chest press',
    );
    const { body: rutina } = await api()
      .post('/planificacion/rutinas')
      .set(con(profesor01))
      .send({
        nombre: 'Fuerza',
        bloques: [
          {
            ejercicioId: press?.id,
            series: 5,
            micropausaSegundos: 20,
            macropausaSegundos: 60,
            repeticiones: 10,
            pesoKg: 30,
            orden: 1,
          },
        ],
        circuitos: [],
      })
      .expect(201);
    await api()
      .post('/planificacion/planes')
      .set(con(profesor01))
      .send({
        fechaInicio: '2026-11-20',
        alumnos: ids,
        dias: Array.from({ length: 28 }, (_, i) => ({
          numero: i + 1,
          rutinaId: i < 2 ? rutina.id : null,
        })),
      })
      .expect(201);
    await entrenar(alumno01, [
      serie(1, 10, 30),
      serie(2, 10, 30),
      serie(3, 8, 30),
      serie(4, 10, 25),
    ]);
    await entrenar(alumno02, [
      serie(1, 10, 30),
      serie(2, 10, 30),
      serie(3, 10, 30),
      serie(4, 10, 30),
      serie(5, 10, 30),
    ]);
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-NOT-01, 02, 03, 04 · el profesor ve su notificación Grave, la marca leída y otro profesor no la ve', async () => {
    const bandeja = await api()
      .get('/notificaciones/mis-notificaciones')
      .set(con(profesor01))
      .expect(200);
    expect(bandeja.body.items).toHaveLength(1);
    expect(bandeja.body).toMatchObject({ total: 1, noLeidas: 1 });
    const [item] = bandeja.body.items;
    expect(item).toMatchObject({
      gravedad: 'grave',
      leida: false,
      totalSeries: 5,
      percepcion: null,
    });
    expect(item.alumno.id).toBeDefined();
    expect(item.entrenamiento.rutina).toBe('Fuerza');
    expect(item).not.toHaveProperty('profesorId');
    expect(item.seriesPorDebajo.map((s: { numero: number }) => s.numero)).toEqual([3, 4, 5]);
    expect(item.seriesPorDebajo[2].realizada).toBeNull();
    await api()
      .get('/notificaciones/mis-notificaciones/no-leidas')
      .set(con(profesor01))
      .expect(200, { cantidad: 1 });

    const ajena = await api()
      .get('/notificaciones/mis-notificaciones')
      .set(con(profesor02))
      .expect(200);
    expect(ajena.body.items).toHaveLength(0);
    await api()
      .put(`/notificaciones/mis-notificaciones/${item.id}/lectura`)
      .set(con(profesor02))
      .expect(404);

    await api()
      .put(`/notificaciones/mis-notificaciones/${item.id}/lectura`)
      .set(con(profesor01))
      .expect(204);
    await api()
      .get('/notificaciones/mis-notificaciones/no-leidas')
      .set(con(profesor01))
      .expect(200, { cantidad: 0 });
    await api()
      .put(`/notificaciones/mis-notificaciones/${item.id}/lectura`)
      .set(con(profesor01))
      .expect(204);
  });

  it('RN-IDE-03 · un alumno no ve la bandeja', async () => {
    await api().get('/notificaciones/mis-notificaciones').set(con(alumno01)).expect(403);
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE notificaciones, series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
