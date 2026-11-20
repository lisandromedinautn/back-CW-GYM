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

describe('US13 · iniciar y consultar el entrenamiento', () => {
  let app: INestApplication;
  let profesor: string;
  let alumno: string;
  let sinPlan: string;
  let alumnoId: string;
  let rutinaId: string;
  let ahora = new Date('2026-11-20T23:59:00.000Z');
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockResolvedValue(undefined);
  const ruta = '/entrenamiento/entrenamientos';
  const iniciar = (token: string) =>
    request(app.getHttpServer()).post(ruta).set('Authorization', `Bearer ${token}`);
  const consultar = (token: string) =>
    request(app.getHttpServer())
      .get('/entrenamiento/mi-entrenamiento-en-curso')
      .set('Authorization', `Bearer ${token}`);

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
    const bd = app.get(DataSource);
    await limpiar(bd);
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    const api = () => request(app.getHttpServer());
    const ingresar = async (email: string): Promise<string> =>
      (
        await api()
          .post('/identidad/ingreso')
          .send({ email, contrasenia: 'clave-de-semilla' })
          .expect(200)
      ).body.token;
    profesor = await ingresar('profesor01@cwgym.test');
    alumno = await ingresar('alumno01@cwgym.test');
    sinPlan = await ingresar('alumno02@cwgym.test');
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
    const plancha = (ejercicios as { id: string; nombre: string }[]).find(
      (e) => e.nombre === 'weighted front plank',
    );
    const { body: rutina } = await api()
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        nombre: 'Fuerza',
        bloques: [
          {
            ejercicioId: press?.id,
            series: 3,
            micropausaSegundos: 20,
            macropausaSegundos: 60,
            repeticiones: 10,
            orden: 2,
          },
        ],
        circuitos: [
          {
            orden: 1,
            vueltas: 2,
            macropausaSegundos: 45,
            ejercicios: [
              { ejercicioId: plancha?.id, segundos: 30 },
              { ejercicioId: press?.id, repeticiones: 8 },
            ],
          },
        ],
      })
      .expect(201);
    rutinaId = rutina.id;
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
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-IDE-03 · no permite iniciar a un Profesor', async () => {
    await iniciar(profesor)
      .expect(403)
      .expect(({ body }) => {
        expect(body.codigo).toBe('RN-IDE-03');
      });
  });

  it('RN-ENT-01 · rechaza un inicio sin plan y uno en día de descanso', async () => {
    await iniciar(sinPlan)
      .expect(409)
      .expect(({ body }) => {
        expect(body.codigo).toBe('RN-ENT-01');
      });
    ahora = new Date('2026-11-22T12:00:00Z');
    try {
      await iniciar(alumno)
        .expect(409)
        .expect(({ body }) => {
          expect(body.codigo).toBe('RN-ENT-01');
        });
    } finally {
      ahora = new Date('2026-11-20T23:59:00Z');
    }
  });

  it('RN-ENT-01, 02 y 20 · inicia una vez, retoma, abandona y permite iniciar al día siguiente', async () => {
    const respuestas = await Promise.all([iniciar(alumno), iniciar(alumno)]);
    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    const creado = respuestas.find((r) => r.status === 201)?.body;
    expect(respuestas.find((r) => r.status === 409)?.body.codigo).toBe('RN-ENT-01');
    expect(creado).toMatchObject({
      id: expect.any(String),
      inicio: '2026-11-20T23:59:00.000Z',
      pesoCorporalKg: 80,
      rutina: {
        nombre: 'Fuerza',
        bloques: [{ repeticiones: 10, orden: 2 }],
        circuitos: [{ orden: 1, ejercicios: [{ segundos: 30 }, { repeticiones: 8 }] }],
      },
    });
    expect(
      publicar.mock.calls.filter(([evento]) => evento.nombre === 'EntrenamientoIniciado'),
    ).toHaveLength(1);
    await request(app.getHttpServer())
      .patch(`/planificacion/rutinas/${rutinaId}/nombre`)
      .set('Authorization', `Bearer ${profesor}`)
      .send({ nombre: 'Fuerza actualizada' })
      .expect(200);
    await app.get(DataSource).query('UPDATE alumnos SET peso_kg = 85 WHERE id = $1', [alumnoId]);
    await consultar(sinPlan).expect(200, { estado: 'sin-entrenamiento' });
    await consultar(alumno).expect(200, { estado: 'en-curso', entrenamiento: creado });
    ahora = new Date('2026-11-21T00:00:00Z');
    await consultar(alumno).expect(200, { estado: 'abandonado', entrenamiento: creado });
    const nuevo = await iniciar(alumno).expect(201);
    expect(nuevo.body.id).not.toBe(creado.id);
    expect(nuevo.body).toMatchObject({
      pesoCorporalKg: 85,
      rutina: { nombre: 'Fuerza actualizada' },
    });
    await consultar(alumno).expect(200, { estado: 'en-curso', entrenamiento: nuevo.body });
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
