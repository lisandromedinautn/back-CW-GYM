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

describe('US17 · percepción del alumno', () => {
  let app: INestApplication;
  let profesor: string;
  let alumno: string;
  let otroAlumno: string;
  let alumnoId: string;
  let entrenamientoId: string;
  let entrenamientoDelOtroId: string;
  let ahora = new Date('2026-11-20T10:00:00.000Z');
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockResolvedValue(undefined);
  const api = () => request(app.getHttpServer());
  const cargar = (token: string, id: string, cuerpo: object) =>
    api()
      .post(`/entrenamiento/entrenamientos/${id}/percepcion`)
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo);

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
    for (const token of [alumno, otroAlumno]) {
      await api()
        .post('/identidad/alumnos/vinculo')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo })
        .expect(200);
    }
    const { body: alumnos } = await api()
      .get('/identidad/alumnos')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    const ids = (alumnos as { id: string }[]).map((a) => a.id);
    await bd.query('UPDATE alumnos SET peso_kg = 80');
    const { body: ejercicios } = await api()
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    const press = (ejercicios as { id: string; nombre: string }[]).find(
      (e) => e.nombre === 'lever chest press',
    );
    const { body: rutina } = await api()
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        nombre: 'Fuerza',
        bloques: [
          {
            ejercicioId: press?.id,
            series: 2,
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
        alumnos: ids,
        dias: Array.from({ length: 28 }, (_, i) => ({
          numero: i + 1,
          rutinaId: i < 2 ? rutina.id : null,
        })),
      })
      .expect(201);
    entrenamientoId = (
      await api()
        .post('/entrenamiento/entrenamientos')
        .set('Authorization', `Bearer ${alumno}`)
        .expect(201)
    ).body.id;
    entrenamientoDelOtroId = (
      await api()
        .post('/entrenamiento/entrenamientos')
        .set('Authorization', `Bearer ${otroAlumno}`)
        .expect(201)
    ).body.id;
    alumnoId = (
      await bd.query('SELECT alumno_id FROM entrenamientos WHERE id = $1', [entrenamientoId])
    )[0].alumno_id;
    ahora = new Date('2026-11-20T10:30:00.000Z');
    await api()
      .post(`/entrenamiento/entrenamientos/${entrenamientoId}/finalizacion`)
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
    ahora = new Date('2026-11-20T11:00:00.000Z');
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('RN-ENT-14, 15, 16, 19 · RN-IDE-03 · carga, lectura y rechazos', async () => {
    await api()
      .post(`/entrenamiento/entrenamientos/${entrenamientoId}/percepcion`)
      .send({ rpe: 9, sensacionFuerza: 2 })
      .expect(401);
    await cargar(profesor, entrenamientoId, { rpe: 9, sensacionFuerza: 2 }).expect(403);
    await cargar(otroAlumno, entrenamientoId, { rpe: 9, sensacionFuerza: 2 }).expect(404);
    await cargar(alumno, entrenamientoId, { rpe: 11, sensacionFuerza: 2 })
      .expect(400)
      .expect(({ body }) => expect(body.codigo).toBe('RN-ENT-14'));
    await cargar(alumno, entrenamientoId, { rpe: 9, sensacionFuerza: 0 })
      .expect(400)
      .expect(({ body }) => expect(body.codigo).toBe('RN-ENT-15'));
    await cargar(otroAlumno, entrenamientoDelOtroId, { rpe: 9, sensacionFuerza: 2 })
      .expect(409)
      .expect(({ body }) => expect(body.codigo).toBe('RN-ENT-16'));

    const sinCargar = await api()
      .get('/entrenamiento/mi-entrenamiento-en-curso')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(200);
    expect(sinCargar.body.entrenamiento.percepcion).toBeNull();

    const cargada = await cargar(alumno, entrenamientoId, { rpe: 9, sensacionFuerza: 2 }).expect(
      201,
    );
    expect(cargada.body).toEqual({ rpe: 9, sensacionFuerza: 2 });

    const propia = await api()
      .get('/entrenamiento/mi-entrenamiento-en-curso')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(200);
    expect(propia.body.entrenamiento.percepcion).toEqual({ rpe: 9, sensacionFuerza: 2 });
    const delProfesor = await api()
      .get(`/entrenamiento/alumnos/${alumnoId}/entrenamientos`)
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    expect(delProfesor.body.items[0].percepcion).toEqual({ rpe: 9, sensacionFuerza: 2 });

    await cargar(alumno, entrenamientoId, { rpe: 5, sensacionFuerza: 5 })
      .expect(409)
      .expect(({ body }) => expect(body.codigo).toBe('RN-ENT-16'));
    expect(
      publicar.mock.calls.filter(([evento]) => evento.nombre === 'PercepcionRegistrada'),
    ).toHaveLength(1);
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
