import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarAdmin } from '../../../src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

const hoy = new Date().toISOString().slice(0, 10);

const sumarDias = (fecha: string, dias: number): string => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
};

const dias = (rutinaId: string | null = null) =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const conRutinaEnElPrimerDia = (rutinaId: string) =>
  dias().map((dia) => (dia.numero === 1 ? { ...dia, rutinaId } : dia));

// Fixture: lever chest press (por repeticiones, Peso Extra).
describe('POST /planificacion/planes', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenAlumno: string;
  let alumnoId: string;
  let alumnoNoVinculadoId: string;
  let rutinaId: string;

  const ingresar = async (email: string, contrasenia: string): Promise<string> =>
    (await request(app.getHttpServer()).post('/identidad/ingreso').send({ email, contrasenia }))
      .body.token;

  const limpiar = async () => {
    await app.get(DataSource).query('TRUNCATE TABLE planes CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE rutinas CASCADE');
    await app.get(DataSource).query('TRUNCATE TABLE alumnos, profesores, usuarios CASCADE');
    await app.get(DataSource).query('DELETE FROM ejercicios');
  };

  const crearPlan = (cuerpo: unknown, token = tokenProfesor) =>
    request(app.getHttpServer())
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo as object);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    await limpiar();
    await app.get(SembrarAdmin).ejecutar();
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();

    tokenProfesor = await ingresar('profesor01@cwgym.test', 'clave-de-semilla');
    tokenAlumno = await ingresar('alumno01@cwgym.test', 'clave-de-semilla');

    // US05: el alumno 01 se vincula con el profesor 01 usando su código vigente.
    const codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesor}`)
    ).body.codigo;
    await request(app.getHttpServer())
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${tokenAlumno}`)
      .send({ codigo });

    const listado = await request(app.getHttpServer())
      .get('/identidad/alumnos')
      .set('Authorization', `Bearer ${tokenProfesor}`);
    alumnoId = listado.body[0].id;
    const sinVinculo = await app
      .get(DataSource)
      .query(
        `SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = 'alumno02@cwgym.test'`,
      );
    alumnoNoVinculadoId = sinVinculo[0].id;

    const catalogo = await request(app.getHttpServer())
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${tokenProfesor}`);
    const press = (catalogo.body as { id: string; nombre: string }[]).find(
      (ejercicio) => ejercicio.nombre === 'lever chest press',
    );
    rutinaId = (
      await request(app.getHttpServer())
        .post('/planificacion/rutinas')
        .set('Authorization', `Bearer ${tokenProfesor}`)
        .send({
          bloques: [
            {
              ejercicioId: press?.id,
              series: 3,
              micropausaSegundos: 60,
              macropausaSegundos: 120,
              repeticiones: 10,
            },
          ],
        })
    ).body.id;
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  describe('GET /identidad/alumnos · el profesor ve solo sus alumnos vinculados (RN-PLAN-13)', () => {
    it('devuelve el alumno vinculado y no al que sigue sin vínculo', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/identidad/alumnos')
        .set('Authorization', `Bearer ${tokenProfesor}`);

      expect(respuesta.body).toEqual([{ id: alumnoId, nombre: 'Martín', apellido: 'Pérez' }]);
    });
  });

  describe('RN-IDE-03 · solo el Profesor puede crear planes', () => {
    it('con el token de un Alumno responde 403', async () => {
      const respuesta = await crearPlan(
        { fechaInicio: hoy, dias: dias(), alumnos: [alumnoId] },
        tokenAlumno,
      );

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });

  describe('RN-PLAN-09 · el plan tiene exactamente 28 días', () => {
    it('con 27 días responde 400 con el código de la regla', async () => {
      const respuesta = await crearPlan({
        fechaInicio: hoy,
        dias: dias().slice(0, 27),
        alumnos: [alumnoId],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-09']);
    });
  });

  describe('RN-PLAN-12 · el plan se crea con al menos un alumno', () => {
    it('sin alumnos responde 400 con el código de la regla', async () => {
      const respuesta = await crearPlan({ fechaInicio: hoy, dias: dias(), alumnos: [] });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-12']);
    });
  });

  describe('RN-PLAN-08 · las rutinas de los días tienen que existir y ser del profesor', () => {
    it('con una rutina inexistente responde 404 con el código de la regla', async () => {
      const respuesta = await crearPlan({
        fechaInicio: hoy,
        dias: conRutinaEnElPrimerDia(randomUUID()),
        alumnos: [alumnoId],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([404, 'RN-PLAN-08']);
    });
  });

  describe('RN-PLAN-13 · solo se asignan alumnos vinculados al profesor', () => {
    it('con un alumno sin vínculo responde 400 con el código de la regla', async () => {
      const respuesta = await crearPlan({
        fechaInicio: hoy,
        dias: dias(),
        alumnos: [alumnoNoVinculadoId],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([400, 'RN-PLAN-13']);
    });
  });

  describe('US07 · el profesor crea el plan de 28 días', () => {
    it('responde 201 con la fecha de fin calculada y los 28 días', async () => {
      const respuesta = await crearPlan({
        fechaInicio: hoy,
        dias: conRutinaEnElPrimerDia(rutinaId),
        alumnos: [alumnoId],
      });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body.fechaFin).toBe(sumarDias(hoy, 27));
      expect(respuesta.body.dias).toHaveLength(28);
      expect(respuesta.body.dias[0]).toEqual({
        numero: 1,
        fecha: hoy,
        rutinaId,
        esDescanso: false,
      });
      expect(respuesta.body.dias[27]).toEqual({
        numero: 28,
        fecha: sumarDias(hoy, 27),
        rutinaId: null,
        esDescanso: true,
      });
    });
  });

  describe('RN-PLAN-14 · un alumno no puede tener dos planes vigentes', () => {
    it('con un segundo plan para el mismo alumno responde 409 con el código de la regla', async () => {
      const respuesta = await crearPlan({
        fechaInicio: hoy,
        dias: dias(),
        alumnos: [alumnoId],
      });

      expect([respuesta.status, respuesta.body.codigo]).toEqual([409, 'RN-PLAN-14']);
    });
  });
});
