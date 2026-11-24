import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PUBLICADOR_EVENTOS } from '../../../src/compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';

describe('US16 · récords al finalizar el entrenamiento', () => {
  let app: INestApplication;
  let bd: DataSource;
  let profesor: string;
  let alumno: string;
  let alumnoId: string;
  let pressId: string;
  let ahora = new Date('2026-11-20T10:00:00.000Z');
  let primeraRespuesta: request.Response;
  let segundaRespuesta: request.Response;
  let segundoEntrenamientoId: string;
  const eventos: { nombre: string }[] = [];
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockImplementation(async (evento) => {
      eventos.push(evento);
    });
  const api = () => request(app.getHttpServer());
  const registrar = (id: string, cuerpo: object) =>
    api()
      .post(`/entrenamiento/entrenamientos/${id}/series`)
      .set('Authorization', `Bearer ${alumno}`)
      .send(cuerpo);
  const finalizar = (id: string) =>
    api()
      .post(`/entrenamiento/entrenamientos/${id}/finalizacion`)
      .set('Authorization', `Bearer ${alumno}`);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(Reloj)
      .useValue({ ahora: () => ahora })
      .overrideProvider(PUBLICADOR_EVENTOS)
      .useValue({ publicar })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    bd = app.get(DataSource);
    await limpiar(bd);
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    const ingresar = async (email: string): Promise<string> =>
      (
        await api()
          .post('/identidad/ingreso')
          .send({ email, contrasenia: 'clave-de-semilla' })
          .expect(200)
      ).body.token;
    profesor = await ingresar('profesor01@cwgym.test');
    alumno = await ingresar('alumno01@cwgym.test');
    const {
      body: { codigo },
    } = await api()
      .post('/identidad/profesores/codigo')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(201);
    await api()
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${alumno}`)
      .send({ codigo })
      .expect(200);
    const { body: alumnos } = await api()
      .get('/identidad/alumnos')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    alumnoId = alumnos[0].id;
    await bd.query('UPDATE alumnos SET peso_kg = 80 WHERE id = $1', [alumnoId]);
    const { body: ejercicios } = await api()
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    const press = (ejercicios as { id: string; nombre: string }[]).find(
      (e) => e.nombre === 'lever chest press',
    );
    pressId = press?.id as string;
    const { body: rutina } = await api()
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        nombre: 'Fuerza',
        bloques: [
          {
            ejercicioId: pressId,
            series: 3,
            micropausaSegundos: 20,
            macropausaSegundos: 60,
            repeticiones: 10,
            orden: 1,
          },
        ],
        circuitos: [],
      })
      .expect(201);
    await api()
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        fechaInicio: '2026-11-20',
        alumnos: [alumnoId],
        dias: Array.from({ length: 28 }, (_, i) => ({
          numero: i + 1,
          rutinaId: i < 2 ? rutina.id : null,
        })),
      })
      .expect(201);

    const primerEntrenamiento = await api()
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
    await registrar(primerEntrenamiento.body.id, {
      orden: 1,
      numero: 1,
      repeticiones: 8,
      pesoKg: 30,
    }).expect(201);
    ahora = new Date('2026-11-20T10:30:00.000Z');
    primeraRespuesta = await finalizar(primerEntrenamiento.body.id).expect(201);
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(bd);
    await app.close();
  });

  it('RN-ENT-13 · la primera marca se guarda pero no se anuncia', async () => {
    expect(primeraRespuesta.body).toMatchObject({
      volumenKg: 240,
      duracionSegundos: 1800,
      gruposMusculares: ['Pecho', 'Brazos'],
    });
    expect(primeraRespuesta.body).not.toHaveProperty('recordsBatidos');
    expect(await filasDeRecords()).toEqual([
      { tipo: '1rm', valor: 38 },
      { tipo: 'repeticiones', valor: 8 },
      { tipo: 'volumen', valor: 240 },
    ]);
    expect(eventos.filter((evento) => evento.nombre === 'RecordBatido')).toHaveLength(0);
  });

  it('RN-ENT-13 · la segunda marca supera los tres récords y se anuncia con nombres', async () => {
    ahora = new Date('2026-11-21T10:00:00.000Z');
    const segundoEntrenamiento = await api()
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
    segundoEntrenamientoId = segundoEntrenamiento.body.id;
    await registrar(segundoEntrenamientoId, {
      orden: 1,
      numero: 1,
      repeticiones: 10,
      pesoKg: 30,
    }).expect(201);
    ahora = new Date('2026-11-21T10:30:00.000Z');
    segundaRespuesta = await finalizar(segundoEntrenamientoId).expect(201);

    expect(segundaRespuesta.body).toMatchObject({
      volumenKg: 300,
      duracionSegundos: 1800,
      gruposMusculares: ['Pecho', 'Brazos'],
      recordsBatidos: [
        {
          ejercicioId: pressId,
          nombre: 'lever chest press',
          tipo: 'repeticiones',
          valorAnterior: 8,
          valorNuevo: 10,
        },
        {
          ejercicioId: pressId,
          nombre: 'lever chest press',
          tipo: 'volumen',
          valorAnterior: 240,
          valorNuevo: 300,
        },
        {
          ejercicioId: pressId,
          nombre: 'lever chest press',
          tipo: '1rm',
          valorAnterior: 38,
          valorNuevo: 40,
        },
      ],
    });
    expect(await filasDeRecords()).toEqual([
      { tipo: '1rm', valor: 40 },
      { tipo: 'repeticiones', valor: 10 },
      { tipo: 'volumen', valor: 300 },
    ]);
    const nombres = eventos.map((evento) => evento.nombre);
    expect(nombres.filter((nombre) => nombre === 'EntrenamientoFinalizado')).toHaveLength(2);
    expect(nombres.filter((nombre) => nombre === 'RecordBatido')).toHaveLength(3);
  });

  it('RN-ENT-05 · una finalización repetida no duplica récords ni eventos', async () => {
    const eventosAntes = eventos.length;
    const recordsAntes = eventos.filter((evento) => evento.nombre === 'RecordBatido').length;

    await finalizar(segundoEntrenamientoId).expect(409);

    expect(await filasDeRecords()).toEqual([
      { tipo: '1rm', valor: 40 },
      { tipo: 'repeticiones', valor: 10 },
      { tipo: 'volumen', valor: 300 },
    ]);
    expect(eventos).toHaveLength(eventosAntes);
    expect(eventos.filter((evento) => evento.nombre === 'RecordBatido')).toHaveLength(recordsAntes);
  });

  async function filasDeRecords() {
    return bd.query(
      `SELECT tipo, valor
         FROM records_personales
        WHERE alumno_id = $1 AND ejercicio_id = $2
        ORDER BY tipo`,
      [alumnoId, pressId],
    );
  }
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE records_personales, series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
