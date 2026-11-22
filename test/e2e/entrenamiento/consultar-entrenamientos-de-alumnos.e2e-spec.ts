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

describe('US18 · consultar los entrenamientos de mis alumnos', () => {
  let app: INestApplication;
  let profesor: string;
  let otroProfesor: string;
  let alumno: string;
  let alumnoId: string;
  let pressId: string;
  let entrenamientoId: string;
  let ahora = new Date('2026-11-20T23:59:00.000Z');
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockResolvedValue(undefined);
  const api = () => request(app.getHttpServer());
  const consultar = (token: string, query = '') =>
    api()
      .get(`/entrenamiento/alumnos/${alumnoId}/entrenamientos${query}`)
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
    const ingresar = async (email: string): Promise<string> =>
      (
        await api()
          .post('/identidad/ingreso')
          .send({ email, contrasenia: 'clave-de-semilla' })
          .expect(200)
      ).body.token;
    profesor = await ingresar('profesor01@cwgym.test');
    otroProfesor = await ingresar('profesor02@cwgym.test');
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
    pressId = (ejercicios as { id: string; nombre: string }[]).find(
      (e) => e.nombre === 'lever chest press',
    )?.id as string;
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

  it('RN-IDE-03 · no permite consultar a un Alumno', async () => {
    await consultar(alumno)
      .expect(403)
      .expect(({ body }) => {
        expect(body.codigo).toBe('RN-IDE-03');
      });
  });

  it('RN-ENT-18 · el profesor ve el entrenamiento en curso de su alumno con la serie registrada', async () => {
    ahora = new Date('2026-11-20T23:59:30.000Z');
    await api()
      .post(`/entrenamiento/entrenamientos/${entrenamientoId}/series`)
      .set('Authorization', `Bearer ${alumno}`)
      .send({ orden: 1, numero: 3, repeticiones: 8, pesoKg: 30 })
      .expect(201);
    const { body } = await consultar(profesor).expect(200);
    expect(body).toMatchObject({
      total: 1,
      pagina: 1,
      tamanio: 10,
      items: [
        {
          id: entrenamientoId,
          alumnoId,
          estado: 'en-curso',
          series: [
            {
              orden: 1,
              numero: 3,
              posicion: null,
              ejercicioId: pressId,
              nombre: 'lever chest press',
              prescripta: { repeticiones: 10, segundos: null, pesoKg: null },
              realizada: { repeticiones: 8, segundos: null, pesoKg: 30 },
            },
          ],
        },
      ],
    });
  });

  it('RN-ENT-18 · otro profesor no ve los entrenamientos del alumno', async () => {
    await consultar(otroProfesor)
      .expect(403)
      .expect(({ body }) => {
        expect(body.codigo).toBe('RN-ENT-18');
      });
  });

  it('RN-ENT-18 · lista del más nuevo al más viejo, paginado', async () => {
    ahora = new Date('2026-11-21T10:00:00.000Z');
    const nuevo = await api()
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
    const { body } = await consultar(profesor, '?tamanio=5').expect(200);
    expect({
      total: body.total,
      tamanio: body.tamanio,
      items: body.items.map(({ id, estado }: { id: string; estado: string }) => ({ id, estado })),
    }).toEqual({
      total: 2,
      tamanio: 5,
      items: [
        { id: nuevo.body.id, estado: 'en-curso' },
        { id: entrenamientoId, estado: 'abandonado' },
      ],
    });
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
