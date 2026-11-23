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

describe('US15 · finalizar entrenamiento', () => {
  let app: INestApplication;
  let profesor: string;
  let alumno: string;
  let otroAlumno: string;
  let entrenamientoId: string;
  let pressId: string;
  let alumnoId: string;
  let ahora = new Date('2026-11-20T10:00:00.000Z');
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockResolvedValue(undefined);
  const registrar = (token: string, id: string, cuerpo: object) =>
    request(app.getHttpServer())
      .post(`/entrenamiento/entrenamientos/${id}/series`)
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo);
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
    otroAlumno = await ingresar('alumno02@cwgym.test');
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
    const inicio = await api()
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
    entrenamientoId = inicio.body.id;
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-IDE-03 y RN-ENT-19 · rechaza sin sesión, profesor y otro alumno', async () => {
    const ruta = `/entrenamiento/entrenamientos/${entrenamientoId}/finalizacion`;
    await request(app.getHttpServer()).post(ruta).expect(401);
    await request(app.getHttpServer())
      .post(ruta)
      .set('Authorization', `Bearer ${profesor}`)
      .expect(403);
    await request(app.getHttpServer())
      .post(ruta)
      .set('Authorization', `Bearer ${otroAlumno}`)
      .expect(404);
  });

  it('RN-ENT-05, 06, 09, 17 · cierra, conserva el resumen y rechaza otra finalización o serie', async () => {
    await registrar(alumno, entrenamientoId, {
      orden: 2,
      numero: 1,
      repeticiones: 8,
      pesoKg: 30,
    }).expect(201);
    ahora = new Date('2026-11-20T10:30:00.000Z');
    const ruta = `/entrenamiento/entrenamientos/${entrenamientoId}/finalizacion`;
    const respuestas = await Promise.all(
      [1, 2].map(() =>
        request(app.getHttpServer()).post(ruta).set('Authorization', `Bearer ${alumno}`),
      ),
    );
    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    const respuesta = respuestas.find((r) => r.status === 201)!;
    expect(respuesta.body).toMatchObject({
      volumenKg: 240,
      duracionSegundos: 1800,
      gruposMusculares: ['Pecho', 'Brazos'],
    });
    const consulta = await consultar(alumno).expect(200);
    expect(consulta.body).toMatchObject({
      estado: 'finalizado',
      entrenamiento: {
        id: entrenamientoId,
        fin: '2026-11-20T10:30:00.000Z',
        resumen: respuesta.body,
      },
    });
    await request(app.getHttpServer())
      .post(ruta)
      .set('Authorization', `Bearer ${alumno}`)
      .expect(409);
    await registrar(alumno, entrenamientoId, { orden: 2, numero: 2, repeticiones: 8 }).expect(409);
    expect(
      publicar.mock.calls.filter(([evento]) => evento.nombre === 'EntrenamientoFinalizado'),
    ).toHaveLength(1);
    expect(pressId).toBeDefined();
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
