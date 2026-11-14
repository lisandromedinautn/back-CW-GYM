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
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

const hoy = new Date().toISOString().slice(0, 10);

const sumarDias = (fecha: string, dias: number): string => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
};

const dias = (rutinaId: string | null = null) =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const conRutinaEnElDia = (numero: number, rutinaId: string) =>
  dias().map((dia) => (dia.numero === numero ? { ...dia, rutinaId } : dia));

// Fixture: lever chest press (por repeticiones, Peso Extra).
describe('GET /planificacion/mi-rutina-del-dia', () => {
  let app: INestApplication;
  let tokenProfesor: string;
  let tokenAlumnoSinPlan: string;
  let tokenAlumnoRutina: string;
  let tokenAlumnoDescanso: string;
  let tokenAlumnoPlanTerminado: string;
  let alumnoRutinaId: string;
  let alumnoDescansoId: string;
  let alumnoPlanTerminadoId: string;
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

  const idDeAlumno = async (email: string): Promise<string> => {
    const filas = await app
      .get(DataSource)
      .query(
        `SELECT a.id FROM alumnos a JOIN usuarios u ON u.id = a.usuario_id WHERE u.email = $1`,
        [email],
      );
    return filas[0].id;
  };

  const crearPlan = (cuerpo: unknown, token = tokenProfesor) =>
    request(app.getHttpServer())
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo as object);

  const miRutina = (token: string) =>
    request(app.getHttpServer())
      .get('/planificacion/mi-rutina-del-dia')
      .set('Authorization', `Bearer ${token}`);

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

    // US05: los cuatro alumnos de este archivo se vinculan con el profesor 01.
    const codigo = (
      await request(app.getHttpServer())
        .post('/identidad/profesores/codigo')
        .set('Authorization', `Bearer ${tokenProfesor}`)
    ).body.codigo;
    const vincular = async (email: string): Promise<string> => {
      const token = await ingresar(email, 'clave-de-semilla');
      await request(app.getHttpServer())
        .post('/identidad/alumnos/vinculo')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo });
      return token;
    };
    tokenAlumnoSinPlan = await vincular('alumno01@cwgym.test');
    tokenAlumnoRutina = await vincular('alumno02@cwgym.test');
    tokenAlumnoDescanso = await vincular('alumno03@cwgym.test');
    tokenAlumnoPlanTerminado = await vincular('alumno04@cwgym.test');

    alumnoRutinaId = await idDeAlumno('alumno02@cwgym.test');
    alumnoDescansoId = await idDeAlumno('alumno03@cwgym.test');
    alumnoPlanTerminadoId = await idDeAlumno('alumno04@cwgym.test');

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
          nombre: 'Piernas',
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

  describe('RN-IDE-03 · solo el Alumno puede consultar su rutina del día', () => {
    it('con el token de un Profesor responde 403', async () => {
      const respuesta = await miRutina(tokenProfesor);

      expect([respuesta.status, respuesta.body.codigo]).toEqual([403, 'RN-IDE-03']);
    });
  });

  describe('RN-PLAN-18 · sin plan vigente se informa que no hay plan', () => {
    it('responde 200 con estado sin-plan y la fecha de hoy', async () => {
      const respuesta = await miRutina(tokenAlumnoSinPlan);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ estado: 'sin-plan', fecha: hoy });
    });
  });

  describe('RN-PLAN-11, 18 · el día del plan se resuelve por la fecha de hoy', () => {
    it('con un plan que empezó hace 3 días devuelve la rutina del día 4', async () => {
      await crearPlan({
        fechaInicio: sumarDias(hoy, -3),
        dias: conRutinaEnElDia(4, rutinaId),
        alumnos: [alumnoRutinaId],
      });

      const respuesta = await miRutina(tokenAlumnoRutina);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({
        estado: 'rutina',
        fecha: hoy,
        numeroDia: 4,
        rutina: { id: rutinaId, nombre: 'Piernas', tipo: 'Bloques' },
      });
      expect(respuesta.body.rutina.bloques[0]).toEqual({
        ejercicioId: expect.any(String),
        nombre: 'lever chest press',
        series: 3,
        micropausaSegundos: 60,
        macropausaSegundos: 120,
        repeticiones: 10,
        segundos: null,
        pesoKg: null,
      });
    });
  });

  describe('RN-PLAN-18 · un día sin rutina se informa como descanso', () => {
    it('con un plan que empezó ayer y hoy es el día 2 sin rutina responde descanso', async () => {
      await crearPlan({
        fechaInicio: sumarDias(hoy, -1),
        dias: dias(),
        alumnos: [alumnoDescansoId],
      });

      const respuesta = await miRutina(tokenAlumnoDescanso);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ estado: 'descanso', fecha: hoy, numeroDia: 2 });
    });
  });

  describe('RN-PLAN-15 · un plan terminado no está vigente', () => {
    it('con un plan cuya fecha de fin fue ayer responde sin-plan', async () => {
      await crearPlan({
        fechaInicio: sumarDias(hoy, -28),
        dias: conRutinaEnElDia(1, rutinaId),
        alumnos: [alumnoPlanTerminadoId],
      });

      const respuesta = await miRutina(tokenAlumnoPlanTerminado);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ estado: 'sin-plan', fecha: hoy });
    });
  });
});
