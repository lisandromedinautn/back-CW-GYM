import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

let fechaActual = new Date('2026-11-14T12:00:00Z');

describe('RN-PLAN-11, 15, 19 · GET /planificacion/mi-plan', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenAlumno: string;
  let tokenSinPlan: string;
  let alumnoId: string;
  let planId: string;
  let piernasId: string;
  let circuitoId: string;
  let pressId: string;
  let planchaId: string;

  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE planes CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE rutinas CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };

  const ingresar = async (email: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/identidad/ingreso')
      .send({ email, contrasenia: 'clave-de-semilla' })
      .expect(200);
    return respuesta.body.token;
  };

  const miPlan = (token: string) =>
    request(app.getHttpServer())
      .get('/planificacion/mi-plan')
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(Reloj)
      .useValue({ ahora: () => fechaActual })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    tokenProfesor = await ingresar('profesor01@cwgym.test');
    const codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .expect(201)
    ).body.codigo;
    const vincular = async (email: string) => {
      const token = await ingresar(email);
      await request(app.getHttpServer())
        .post('/identidad/alumnos/vinculo')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo })
        .expect(200);
      return token;
    };
    tokenAlumno = await vincular('alumno01@cwgym.test');
    tokenSinPlan = await vincular('alumno02@cwgym.test');
    // Fixture: identifico la ficha sembrada para asignarle el plan desde la API.
    const filas = await app
      .get(DataSource)
      .query(
        'SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = $1',
        ['alumno01@cwgym.test'],
      );
    alumnoId = filas[0].id;
    const catalogo = await request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${tokenProfesor}`)
      .expect(200);
    const ejercicios = catalogo.body as { id: string; nombre: string }[];
    const press = ejercicios.find((ejercicio) => ejercicio.nombre === 'lever chest press');
    const plancha = ejercicios.find((ejercicio) => ejercicio.nombre === 'weighted front plank');
    if (!press || !plancha) throw new Error('Faltan ejercicios del fixture');
    pressId = press.id;
    planchaId = plancha.id;
    const crearRutina = (cuerpo: object) =>
      request(app.getHttpServer())
        .post('/planificacion/rutinas')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send(cuerpo)
        .expect(201);
    piernasId = (
      await crearRutina({
        nombre: 'Piernas',
        bloques: [
          {
            ejercicioId: pressId,
            series: 3,
            repeticiones: 10,
            pesoKg: 20,
            micropausaSegundos: 60,
            macropausaSegundos: 120,
          },
        ],
      })
    ).body.id;
    circuitoId = (
      await crearRutina({
        nombre: 'Circuito',
        circuitos: [
          {
            vueltas: 3,
            macropausaSegundos: 90,
            ejercicios: [
              { ejercicioId: pressId, repeticiones: 10, pesoKg: 20 },
              { ejercicioId: planchaId, segundos: 30 },
            ],
          },
        ],
      })
    ).body.id;
    const plan = await request(app.getHttpServer())
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${tokenProfesor}`)
      .send({
        fechaInicio: '2026-11-01',
        alumnos: [alumnoId],
        dias: Array.from({ length: 28 }, (_, indice) => ({
          numero: indice + 1,
          rutinaId: indice === 0 ? piernasId : indice === 27 ? circuitoId : null,
        })),
      })
      .expect(201);
    planId = plan.body.id;
  });

  beforeEach(() => {
    fechaActual = new Date('2026-11-14T12:00:00Z');
  });

  afterAll(async () => {
    if (app) {
      await limpiar();
      await app.close();
    }
  });

  it('devuelve los 28 días con fechas, rutinas y descansos', async () => {
    const respuesta = await miPlan(tokenAlumno);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      estado: 'plan',
      fecha: '2026-11-14',
      plan: { id: planId, fechaInicio: '2026-11-01', fechaFin: '2026-11-28' },
    });
    expect(Object.keys(respuesta.body.plan).sort()).toEqual([
      'dias',
      'fechaFin',
      'fechaInicio',
      'id',
    ]);
    const dias = respuesta.body.plan.dias as { numero: number; fecha: string; rutina: unknown }[];
    expect(dias.map(({ numero, fecha }) => [numero, fecha])).toEqual([
      [1, '2026-11-01'],
      [2, '2026-11-02'],
      [3, '2026-11-03'],
      [4, '2026-11-04'],
      [5, '2026-11-05'],
      [6, '2026-11-06'],
      [7, '2026-11-07'],
      [8, '2026-11-08'],
      [9, '2026-11-09'],
      [10, '2026-11-10'],
      [11, '2026-11-11'],
      [12, '2026-11-12'],
      [13, '2026-11-13'],
      [14, '2026-11-14'],
      [15, '2026-11-15'],
      [16, '2026-11-16'],
      [17, '2026-11-17'],
      [18, '2026-11-18'],
      [19, '2026-11-19'],
      [20, '2026-11-20'],
      [21, '2026-11-21'],
      [22, '2026-11-22'],
      [23, '2026-11-23'],
      [24, '2026-11-24'],
      [25, '2026-11-25'],
      [26, '2026-11-26'],
      [27, '2026-11-27'],
      [28, '2026-11-28'],
    ]);
    expect(dias[0].rutina).toEqual({
      id: piernasId,
      nombre: 'Piernas',
      tipo: 'Bloques',
      bloques: [
        {
          ejercicioId: pressId,
          nombre: 'lever chest press',
          series: 3,
          repeticiones: 10,
          segundos: null,
          pesoKg: 20,
          micropausaSegundos: 60,
          macropausaSegundos: 120,
        },
      ],
      circuitos: [],
    });
    expect(dias.slice(1, 27).every((dia) => dia.rutina === null)).toBe(true);
    expect(dias[27].rutina).toEqual({
      id: circuitoId,
      nombre: 'Circuito',
      tipo: 'Circuitos',
      bloques: [],
      circuitos: [
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [
            {
              ejercicioId: pressId,
              nombre: 'lever chest press',
              repeticiones: 10,
              segundos: null,
              pesoKg: 20,
            },
            {
              ejercicioId: planchaId,
              nombre: 'weighted front plank',
              repeticiones: null,
              segundos: 30,
              pesoKg: null,
            },
          ],
        },
      ],
    });
  });

  describe('RN-IDE-03 · solo un Alumno autenticado consulta su plan', () => {
    it('sin token responde 401', async () => {
      const respuesta = await request(app.getHttpServer()).get('/planificacion/mi-plan');

      expect([respuesta.status, respuesta.body.codigo]).toEqual([401, 'RN-IDE-03']);
    });

    it('un Profesor recibe 403', async () => {
      const respuesta = await miPlan(tokenProfesor);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });

  it('sin plan vigente informa sin-plan', async () => {
    const respuesta = await miPlan(tokenSinPlan);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'sin-plan', fecha: '2026-11-14' });
  });

  it('ignora el alumno ajeno indicado por query', async () => {
    const respuesta = await miPlan(tokenSinPlan).query({ alumnoId });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'sin-plan', fecha: '2026-11-14' });
  });

  it.each(['2026-11-01', '2026-11-28'])('incluye ambos extremos: %s', async (fecha) => {
    fechaActual = new Date(`${fecha}T12:00:00Z`);

    const respuesta = await miPlan(tokenAlumno);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: 'plan', fecha, plan: { id: planId } });
    expect(respuesta.body.plan.dias).toHaveLength(28);
    expect(respuesta.body.plan.dias[0]).toMatchObject({
      numero: 1,
      fecha: '2026-11-01',
      rutina: { id: piernasId },
    });
    expect(respuesta.body.plan.dias[27]).toMatchObject({
      numero: 28,
      fecha: '2026-11-28',
      rutina: { id: circuitoId },
    });
  });

  it.each(['2026-10-31', '2026-11-29'])('fuera de vigencia informa sin-plan: %s', async (fecha) => {
    fechaActual = new Date(`${fecha}T12:00:00Z`);

    const respuesta = await miPlan(tokenAlumno);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'sin-plan', fecha });
  });
});
