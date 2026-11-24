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

describe('RN-NOT-01, 05, 06, 07 · la percepción del alumno suma, crea y reabre la notificación', () => {
  let app: INestApplication;
  let profesor01: string;
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
  const serie = (numero: number, repeticiones: number, pesoKg: number) => ({
    orden: 1,
    numero,
    repeticiones,
    pesoKg,
  });
  const entrenar = async (alumno: string, series: object[]): Promise<string> => {
    const { body } = await api().post('/entrenamiento/entrenamientos').set(con(alumno)).expect(201);
    for (const s of series) {
      await api()
        .post(`/entrenamiento/entrenamientos/${body.id}/series`)
        .set(con(alumno))
        .send(s)
        .expect(201);
    }
    await api()
      .post(`/entrenamiento/entrenamientos/${body.id}/finalizacion`)
      .set(con(alumno))
      .expect(201);
    return body.id;
  };
  const percibir = async (
    alumno: string,
    entrenamientoId: string,
    percepcion: { rpe: number; sensacionFuerza: number },
  ): Promise<void> => {
    await api()
      .post(`/entrenamiento/entrenamientos/${entrenamientoId}/percepcion`)
      .set(con(alumno))
      .send(percepcion)
      .expect(201);
  };
  const bandeja = async () =>
    (await api().get('/notificaciones/mis-notificaciones').set(con(profesor01)).expect(200)).body;

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
    const alumno01 = await ingresar('alumno01@cwgym.test');
    const alumno02 = await ingresar('alumno02@cwgym.test');
    const alumno03 = await ingresar('alumno03@cwgym.test');
    await vincular(alumno01);
    await vincular(alumno02);
    await vincular(alumno03);
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

    const completas = [1, 2, 3, 4, 5].map((n) => serie(n, 10, 30));
    const entrenamiento01 = await entrenar(alumno01, [
      serie(1, 10, 30),
      serie(2, 10, 30),
      serie(3, 8, 30),
      serie(4, 10, 25),
    ]);
    const primera = await bandeja();
    await api()
      .put(`/notificaciones/mis-notificaciones/${primera.items[0].id}/lectura`)
      .set(con(profesor01))
      .expect(204);
    await percibir(alumno01, entrenamiento01, { rpe: 9, sensacionFuerza: 3 });
    const entrenamiento02 = await entrenar(alumno02, completas);
    await percibir(alumno02, entrenamiento02, { rpe: 10, sensacionFuerza: 1 });
    const entrenamiento03 = await entrenar(alumno03, completas);
    await percibir(alumno03, entrenamiento03, { rpe: 8, sensacionFuerza: 3 });
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-NOT-05, 06, 07 · suma, crea solo por percepción mala y vuelve a no leída', async () => {
    const { body } = await api()
      .get('/notificaciones/mis-notificaciones')
      .set(con(profesor01))
      .expect(200);
    expect(body).toMatchObject({ total: 2, noLeidas: 2 });
    const items = body.items as {
      gravedad: string;
      leida: boolean;
      alumno: { id: string };
      seriesPorDebajo: unknown[];
      percepcion: { rpe: number; sensacionFuerza: number } | null;
    }[];
    const n01 = items.find((i) => i.seriesPorDebajo.length > 0);
    const n02 = items.find((i) => i.seriesPorDebajo.length === 0);
    expect(n01).toMatchObject({
      gravedad: 'grave',
      leida: false,
      percepcion: { rpe: 9, sensacionFuerza: 3 },
    });
    expect(n02).toMatchObject({
      gravedad: 'grave',
      seriesPorDebajo: [],
      percepcion: { rpe: 10, sensacionFuerza: 1 },
    });
    expect(items.filter((i) => i.percepcion?.rpe === 8)).toHaveLength(0);
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE notificaciones, series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
