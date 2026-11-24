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

describe('RN-NOT-08 · alerta de incumplimiento repetido de punta a punta', () => {
  let app: INestApplication;
  let profesor01: string;
  let alumno01: string;
  // Reloj fijo por día: se mueve de un día al otro entre finalizaciones.
  let ahora = new Date('2026-11-20T10:00:00.000Z');
  const api = () => request(app.getHttpServer());
  const con = (token: string) => ({ Authorization: `Bearer ${token}` });
  const ingresar = async (email: string): Promise<string> =>
    (
      await api()
        .post('/identidad/ingreso')
        .send({ email, contrasenia: 'clave-de-semilla' })
        .expect(200)
    ).body.token;
  const serie = (numero: number, repeticiones: number, pesoKg: number) => ({
    orden: 1,
    numero,
    repeticiones,
    pesoKg,
  });
  /** El alumno entrena el día indicado y deja la última serie sin registrar (por debajo). */
  const entrenarPorDebajo = async (dia: string): Promise<void> => {
    ahora = new Date(`2026-11-${dia}T10:00:00.000Z`);
    const { body } = await api()
      .post('/entrenamiento/entrenamientos')
      .set(con(alumno01))
      .expect(201);
    for (const n of [1, 2, 3, 4]) {
      await api()
        .post(`/entrenamiento/entrenamientos/${body.id}/series`)
        .set(con(alumno01))
        .send(serie(n, 10, 30))
        .expect(201);
    }
    await api()
      .post(`/entrenamiento/entrenamientos/${body.id}/finalizacion`)
      .set(con(alumno01))
      .expect(201);
  };

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
    alumno01 = await ingresar('alumno01@cwgym.test');
    const {
      body: { codigo },
    } = await api().post('/identidad/profesores/codigo').set(con(profesor01)).expect(201);
    await api().post('/identidad/alumnos/vinculo').set(con(alumno01)).send({ codigo }).expect(200);
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
          rutinaId: i < 3 ? rutina.id : null,
        })),
      })
      .expect(201);
    for (const dia of ['20', '21', '22']) await entrenarPorDebajo(dia);
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-NOT-08, 01 · tres finalizaciones por debajo en tres días: la bandeja suma la alerta a las tres notificaciones', async () => {
    const bandeja = await api()
      .get('/notificaciones/mis-notificaciones')
      .set(con(profesor01))
      .expect(200);

    expect(bandeja.body).toMatchObject({ total: 4, noLeidas: 4 });
    const items = bandeja.body.items as {
      tipo: string;
      gravedad: string;
      leida: boolean;
      alumno: { id: string; nombre: string };
      entrenamientos?: { id: string; fecha: string; rutina: string }[];
    }[];
    expect(items.filter((i) => i.tipo === 'entrenamiento')).toHaveLength(3);
    const alertas = items.filter((i) => i.tipo === 'alerta-incumplimiento');
    expect(alertas).toHaveLength(1);
    const alerta = alertas[0]!;
    expect(alerta).toMatchObject({ gravedad: 'grave', leida: false });
    expect(alerta.alumno.id).toBeDefined();
    expect(alerta.entrenamientos).toHaveLength(3);
    expect(alerta.entrenamientos!.map((e) => e.rutina)).toEqual(['Fuerza', 'Fuerza', 'Fuerza']);
    expect(alerta.entrenamientos!.map((e) => e.fecha.slice(0, 10))).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ]);
    await api()
      .get('/notificaciones/mis-notificaciones/no-leidas')
      .set(con(profesor01))
      .expect(200, { cantidad: 4 });
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE notificaciones, finalizaciones_alumno, series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
