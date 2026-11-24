import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { RelojFijo } from '../../dobles/planificacion.js';

// US22 (Lisandro, 24/11/2026). Reloj fijado al 24/11/2026: el plan arranca el 21/11, así el
// día 2 (22/11) es pasado, el día 4 (24/11) es hoy y el día 10 (30/11) es futuro.
const FECHA_INICIO = '2026-11-21';

describe('RN-PLAN-23 · PUT /planificacion/planes/:id/dias/:numero', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenProfesorOtro: string;
  let tokenAlumno: string;
  let alumno01Id: string;
  let alumno03Id: string;
  let rutinaId: string;
  let planId: string;
  let planAjenoId: string;

  const ingresar = async (email: string, contrasenia = 'clave-de-semilla'): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;

  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE entrenamientos CASCADE');
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

  const editarDia = (token: string, id: string, numero: number, cuerpo: object) =>
    request(app.getHttpServer())
      .put(`/planificacion/planes/${id}/dias/${numero}`)
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo);

  const miPlan = (token: string) =>
    request(app.getHttpServer())
      .get('/planificacion/mi-plan')
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .overrideProvider(Reloj)
      .useValue(new RelojFijo(new Date(Date.UTC(2026, 10, 24))))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();

    tokenProfesor = await ingresar('profesor01@cwgym.test');
    tokenProfesorOtro = await ingresar('profesor02@cwgym.test');
    tokenAlumno = await ingresar('alumno01@cwgym.test');
    const tokenAlumno03 = await ingresar('alumno03@cwgym.test');

    await vincular(tokenProfesor, tokenAlumno);
    await vincular(tokenProfesorOtro, tokenAlumno03);
    alumno01Id = await idDeAlumno('alumno01@cwgym.test');
    alumno03Id = await idDeAlumno('alumno03@cwgym.test');

    const catalogo = await request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${tokenProfesor}`);
    const press = (catalogo.body as { id: string; nombre: string }[]).find(
      (ejercicio) => ejercicio.nombre === 'lever chest press',
    );
    if (!press) throw new Error('Falta el ejercicio del fixture');

    rutinaId = (
      await request(app.getHttpServer())
        .post('/planificacion/rutinas')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send({
          nombre: 'Pecho',
          bloques: [
            {
              ejercicioId: press.id,
              series: 3,
              repeticiones: 10,
              pesoKg: 20,
              micropausaSegundos: 60,
              macropausaSegundos: 120,
            },
          ],
        })
        .expect(201)
    ).body.id;

    const dias = (numeroConRutina: number) =>
      Array.from({ length: 28 }, (_, indice) => ({
        numero: indice + 1,
        rutinaId: indice + 1 === numeroConRutina ? rutinaId : null,
      }));
    planId = (
      await request(app.getHttpServer())
        .post('/planificacion/planes')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send({ fechaInicio: FECHA_INICIO, dias: dias(4), alumnos: [alumno01Id] })
        .expect(201)
    ).body.id;
    planAjenoId = (
      await request(app.getHttpServer())
        .post('/planificacion/planes')
        .set('Authorization', `Bearer ${tokenProfesorOtro}`)
        .send({ fechaInicio: FECHA_INICIO, dias: dias(0), alumnos: [alumno03Id] })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar();
    await app.close();
  });

  it('E1 un día futuro cambia de rutina y el alumno la ve en mi-plan', async () => {
    const respuesta = await editarDia(tokenProfesor, planId, 10, { rutinaId });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({
      numero: 10,
      fecha: '2026-11-30',
      rutinaId,
      esDescanso: false,
    });

    const plan = await miPlan(tokenAlumno);
    const dia = (plan.body.plan.dias as { numero: number; rutina: { id: string } | null }[]).find(
      (d) => d.numero === 10,
    );
    expect(dia?.rutina?.id).toBe(rutinaId);
  });

  it('E2 un día pasado responde 409 con RN-PLAN-23', async () => {
    const respuesta = await editarDia(tokenProfesor, planId, 2, { rutinaId: null });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.codigo).toBe('RN-PLAN-23');
  });

  it('E2 un plan de otro profesor responde 404', async () => {
    const respuesta = await editarDia(tokenProfesor, planAjenoId, 10, { rutinaId });

    expect(respuesta.status).toBe(404);
  });

  it('E2 con el token de un Alumno responde 403', async () => {
    const respuesta = await editarDia(tokenAlumno, planId, 10, { rutinaId: null });

    expect(respuesta.status).toBe(403);
  });

  it('E2 hoy con un entrenamiento iniciado responde 409 con RN-PLAN-23', async () => {
    const inicio = await request(app.getHttpServer())
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${tokenAlumno}`);
    expect(inicio.status).toBe(201);

    const respuesta = await editarDia(tokenProfesor, planId, 4, { rutinaId: null });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.codigo).toBe('RN-PLAN-23');
  });
});

describe('RN-PLAN-22 · GET /planificacion/planes/:id', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenProfesorOtro: string;
  let tokenAlumno: string;
  let planId: string;
  let planAjenoId: string;

  const ingresar = async (email: string): Promise<string> =>
    (
      await request(app.getHttpServer())
        .post('/identidad/ingreso')
        .send({ email, contrasenia: 'clave-de-semilla' })
    ).body.token;

  const detalle = (token: string, id: string) =>
    request(app.getHttpServer())
      .get(`/planificacion/planes/${id}`)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .overrideProvider(Reloj)
      .useValue(new RelojFijo(new Date(Date.UTC(2026, 10, 24))))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    const bd = app.get(DataSource);
    await bd.query('TRUNCATE TABLE entrenamientos CASCADE');
    await bd.query('TRUNCATE TABLE planes CASCADE');
    await bd.query('TRUNCATE TABLE rutinas CASCADE');
    await bd.query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();

    tokenProfesor = await ingresar('profesor01@cwgym.test');
    tokenProfesorOtro = await ingresar('profesor02@cwgym.test');
    tokenAlumno = await ingresar('alumno01@cwgym.test');
    const tokenAlumno03 = await ingresar('alumno03@cwgym.test');
    const codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesor}`)
    ).body.codigo;
    await request(app.getHttpServer())
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${tokenAlumno}`)
      .send({ codigo });
    const codigoOtro = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesorOtro}`)
    ).body.codigo;
    await request(app.getHttpServer())
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${tokenAlumno03}`)
      .send({ codigo: codigoOtro });

    const alumnoId = (
      await bd.query(
        'SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = $1',
        ['alumno01@cwgym.test'],
      )
    )[0].id;
    const alumnoOtroId = (
      await bd.query(
        'SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = $1',
        ['alumno03@cwgym.test'],
      )
    )[0].id;
    const dias = Array.from({ length: 28 }, (_, indice) => ({
      numero: indice + 1,
      rutinaId: null,
    }));
    planId = (
      await request(app.getHttpServer())
        .post('/planificacion/planes')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send({ fechaInicio: FECHA_INICIO, dias, alumnos: [alumnoId] })
        .expect(201)
    ).body.id;
    planAjenoId = (
      await request(app.getHttpServer())
        .post('/planificacion/planes')
        .set('Authorization', `Bearer ${tokenProfesorOtro}`)
        .send({ fechaInicio: FECHA_INICIO, dias, alumnos: [alumnoOtroId] })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    if (!app) return;
    const bd = app.get(DataSource);
    await bd.query('TRUNCATE TABLE entrenamientos CASCADE');
    await bd.query('TRUNCATE TABLE planes CASCADE');
    await bd.query('TRUNCATE TABLE rutinas CASCADE');
    await bd.query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.close();
  });

  it('E3 el profesor ve su plan con sus 28 días', async () => {
    const respuesta = await detalle(tokenProfesor, planId);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.dias).toHaveLength(28);
  });

  it('E3 el plan de otro profesor responde 404', async () => {
    const respuesta = await detalle(tokenProfesor, planAjenoId);

    expect(respuesta.status).toBe(404);
  });

  it('E3 con el token de un Alumno responde 403', async () => {
    const respuesta = await detalle(tokenAlumno, planId);

    expect(respuesta.status).toBe(403);
  });
});
