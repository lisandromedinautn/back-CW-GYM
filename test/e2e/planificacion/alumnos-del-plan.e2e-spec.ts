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

describe('US12 · alumnos de planes vigentes', () => {
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

  it('permite agregar y quitar alumnos sin alterar los días del plan', async () => {
    const base = `/planificacion/planes/${planVigente}/alumnos`;
    const alta = await request(app.getHttpServer())
      .post(base)
      .set('Authorization', `Bearer ${tokenProfesor}`)
      .send({ alumnoId: alumno02Id });
    expect(alta.status).toBe(201);
    const consulta = await request(app.getHttpServer())
      .get(base)
      .set('Authorization', `Bearer ${tokenProfesor}`);
    expect(consulta.body.alumnoIds.sort()).toEqual([alumno01Id, alumno02Id].sort());
    const baja = await request(app.getHttpServer())
      .delete(`${base}/${alumno02Id}`)
      .set('Authorization', `Bearer ${tokenProfesor}`);
    expect(baja.status).toBe(200);
    const filas = await app
      .get(DataSource)
      .query('SELECT count(*)::int AS cantidad FROM dias_plan WHERE plan_id = $1', [planVigente]);
    expect(filas[0].cantidad).toBe(28);
  });

  it('rechaza acceso sin sesión, alumno y profesor ajeno', async () => {
    const base = `/planificacion/planes/${planVigente}/alumnos`;
    expect((await request(app.getHttpServer()).get(base)).status).toBe(401);
    expect(
      (await request(app.getHttpServer()).get(base).set('Authorization', `Bearer ${tokenAlumno}`))
        .status,
    ).toBe(403);
    expect(
      (
        await request(app.getHttpServer())
          .get(base)
          .set('Authorization', `Bearer ${tokenProfesorOtro}`)
      ).status,
    ).toBe(404);
  });

  it('rechaza alumnos ajenos y planes fuera de vigencia', async () => {
    const cabecera = `Bearer ${tokenProfesor}`;
    const ajeno = await request(app.getHttpServer())
      .post(`/planificacion/planes/${planVigente}/alumnos`)
      .set('Authorization', cabecera)
      .send({ alumnoId: alumno03Id });
    expect([ajeno.status, ajeno.body.codigo]).toEqual([400, 'RN-PLAN-13']);
    for (const id of [planProximo, planFinalizado]) {
      const respuesta = await request(app.getHttpServer())
        .post(`/planificacion/planes/${id}/alumnos`)
        .set('Authorization', cabecera)
        .send({ alumnoId: alumno02Id });
      expect([respuesta.status, respuesta.body.codigo]).toEqual([409, 'RN-PLAN-16']);
    }
    expect(planAjeno).toBeDefined();
  });
  it('RN-PLAN-14 · dos asignaciones simultáneas dejan al alumno en un solo plan vigente', async () => {
    const cabecera = `Bearer ${tokenProfesor}`;
    await request(app.getHttpServer())
      .delete(`/planificacion/planes/${planVigente}/alumnos/${alumno01Id}`)
      .set('Authorization', cabecera);
    const otroPlan = await crearPlan(tokenProfesor, '2026-11-01', [alumno01Id]);
    const respuestas = await Promise.all(
      [planVigente, otroPlan].map((id) =>
        request(app.getHttpServer())
          .post(`/planificacion/planes/${id}/alumnos`)
          .set('Authorization', cabecera)
          .send({ alumnoId: alumno02Id }),
      ),
    );
    expect(respuestas.map((respuesta) => respuesta.status).sort()).toEqual([201, 409]);
  });
});
