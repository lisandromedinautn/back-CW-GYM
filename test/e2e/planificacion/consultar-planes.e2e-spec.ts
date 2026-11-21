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
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { RelojFijo } from '../../dobles/planificacion.js';

// Reloj fijado al 21/11/2026 para que los estados (RN-PLAN-15) no dependan de la fecha real.
const dias = (rutinaId: string | null = null) =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

describe('GET /planificacion/planes', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenProfesorOtro: string;
  let tokenAlumno: string;
  let alumno01Id: string;
  let alumno02Id: string;
  let alumno03Id: string;
  let planProximo: string;
  let planVigente: string;
  let planFinalizado: string;
  let planAjeno: string;

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;

  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE planes CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE rutinas CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };

  const idDeAlumno = async (email: string): Promise<string> =>
    (
      await app
        .get(DataSource)
        .query(
          'SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = $1',
          [email],
        )
    )[0].id;

  const vincular = async (tokenDelProfesor: string, tokenDelAlumno: string) => {
    const codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenDelProfesor}`)
    ).body.codigo;
    await request(app.getHttpServer())
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${tokenDelAlumno}`)
      .send({ codigo });
  };

  const crearPlan = async (token: string, fechaInicio: string, alumnos: string[]) =>
    (
      await request(app.getHttpServer())
        .post('/planificacion/planes')
        .set('Authorization', `Bearer ${token}`)
        .send({ fechaInicio, dias: dias(), alumnos })
    ).body.id as string;

  const listar = (query: Record<string, string | number> = {}, token = tokenProfesor) =>
    request(app.getHttpServer())
      .get('/planificacion/planes')
      .query(query)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .overrideProvider(Reloj)
      .useValue(new RelojFijo(new Date(Date.UTC(2026, 10, 21))))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();

    tokenProfesor = await ingresar('profesor01@cwgym.test', 'clave-de-semilla');
    tokenProfesorOtro = await ingresar('profesor02@cwgym.test', 'clave-de-semilla');
    tokenAlumno = await ingresar('alumno01@cwgym.test', 'clave-de-semilla');
    const tokenAlumno02 = await ingresar('alumno02@cwgym.test', 'clave-de-semilla');
    const tokenAlumno03 = await ingresar('alumno03@cwgym.test', 'clave-de-semilla');

    await vincular(tokenProfesor, tokenAlumno);
    await vincular(tokenProfesor, tokenAlumno02);
    await vincular(tokenProfesorOtro, tokenAlumno03);

    alumno01Id = await idDeAlumno('alumno01@cwgym.test');
    alumno02Id = await idDeAlumno('alumno02@cwgym.test');
    alumno03Id = await idDeAlumno('alumno03@cwgym.test');

    planFinalizado = await crearPlan(tokenProfesor, '2026-10-01', [alumno01Id]);
    planVigente = await crearPlan(tokenProfesor, '2026-11-01', [alumno01Id]);
    planProximo = await crearPlan(tokenProfesor, '2026-12-01', [alumno02Id]);
    planAjeno = await crearPlan(tokenProfesorOtro, '2026-11-01', [alumno03Id]);
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('RN-IDE-03 · solo el Profesor consulta los planes', () => {
    it('sin token responde 401', async () => {
      const respuesta = await request(app.getHttpServer()).get('/planificacion/planes');

      expect(respuesta.status).toBe(401);
    });

    it('con el token de un Alumno responde 403', async () => {
      const respuesta = await listar({}, tokenAlumno);

      expect(respuesta.status).toBe(403);
    });

    it('con el token del Profesor responde 200', async () => {
      const respuesta = await listar();

      expect(respuesta.status).toBe(200);
    });
  });

  describe('RN-PLAN-22 · el profesor no ve los planes de otro profesor', () => {
    it('profesor01 ve sus 3 planes y no el del profesor02', async () => {
      const respuesta = await listar();

      expect({
        total: respuesta.body.total,
        ids: respuesta.body.items.map((plan: { id: string }) => plan.id),
      }).toEqual({ total: 3, ids: [planProximo, planVigente, planFinalizado] });
    });

    it('profesor02 ve solo su plan', async () => {
      const respuesta = await listar({}, tokenProfesorOtro);

      expect({
        total: respuesta.body.total,
        ids: respuesta.body.items.map((plan: { id: string }) => plan.id),
      }).toEqual({ total: 1, ids: [planAjeno] });
    });
  });

  describe('RN-PLAN-15 · el estado sale del reloj (21/11/2026)', () => {
    it('muestra proximo, vigente y finalizado según las fechas del plan', async () => {
      const respuesta = await listar();

      expect(
        respuesta.body.items.map((plan: { fechaInicio: string; estado: string }) => [
          plan.fechaInicio,
          plan.estado,
        ]),
      ).toEqual([
        ['2026-12-01', 'proximo'],
        ['2026-11-01', 'vigente'],
        ['2026-10-01', 'finalizado'],
      ]);
    });
  });

  describe('RN-PLAN-22 · filtra por estado, alumno y rango de fecha de inicio', () => {
    it('estado=vigente devuelve solo el plan vigente', async () => {
      const respuesta = await listar({ estado: 'vigente' });

      expect(respuesta.body.items.map((plan: { id: string }) => plan.id)).toEqual([planVigente]);
    });

    it('alumnoId devuelve solo los planes de ese alumno', async () => {
      const respuesta = await listar({ alumnoId: alumno02Id });

      expect(respuesta.body.items.map((plan: { id: string }) => plan.id)).toEqual([planProximo]);
    });

    it('inicioDesde e inicioHasta incluyen ambos extremos', async () => {
      const respuesta = await listar({ inicioDesde: '2026-10-01', inicioHasta: '2026-11-01' });

      expect(respuesta.body.items.map((plan: { id: string }) => plan.id)).toEqual([
        planVigente,
        planFinalizado,
      ]);
    });

    it('los filtros se combinan: estado=finalizado y alumnoId del alumno 01', async () => {
      const respuesta = await listar({ estado: 'finalizado', alumnoId: alumno01Id });

      expect(respuesta.body.items.map((plan: { id: string }) => plan.id)).toEqual([planFinalizado]);
    });
  });

  describe('RN-PLAN-22 · una consulta con valores inválidos responde 400', () => {
    it('tamanio=7 responde 400', async () => {
      const respuesta = await listar({ tamanio: 7 });

      expect(respuesta.status).toBe(400);
    });

    it('estado=raro responde 400', async () => {
      const respuesta = await listar({ estado: 'raro' });

      expect(respuesta.status).toBe(400);
    });

    it('inicioDesde=2026-13-01 responde 400', async () => {
      const respuesta = await listar({ inicioDesde: '2026-13-01' });

      expect(respuesta.status).toBe(400);
    });
  });
});
