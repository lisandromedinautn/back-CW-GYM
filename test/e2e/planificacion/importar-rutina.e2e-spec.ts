import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { ConsultaVinculos } from '../../../src/modulos/planificacion/dominio/plan/consulta-vinculos.puerto.js';
import { RepositorioRutinas } from '../../../src/modulos/planificacion/dominio/rutina/repositorio-rutinas.puerto.js';
import { Bloque } from '../../../src/modulos/planificacion/dominio/rutina/bloque.entidad.js';
import { Circuito } from '../../../src/modulos/planificacion/dominio/rutina/circuito.entidad.js';
import { Rutina } from '../../../src/modulos/planificacion/dominio/rutina/rutina.entidad.js';

describe('RN-PLAN-08 · POST /planificacion/rutinas/:id/importacion', () => {
  let app: INestApplication;
  let rutinas: RepositorioRutinas;
  let original: Rutina;
  const profesor = randomUUID();
  const otro = randomUUID();
  const alumno = randomUUID();
  let token: string;
  let tokenOtro: string;
  let tokenAlumno: string;
  let copiaId = '';
  let planId = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(ConsultaVinculos)
      .useValue({ alumnoVinculadoAProfesor: async () => true })
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    rutinas = app.get(RepositorioRutinas);
    const jwt = app.get(JwtService);
    token = jwt.sign({ sub: profesor, rol: 'Profesor' });
    tokenOtro = jwt.sign({ sub: otro, rol: 'Profesor' });
    tokenAlumno = jwt.sign({ sub: alumno, rol: 'Alumno' });
    const bloque = Bloque.reconstruir(randomUUID(), {
      ejercicioId: randomUUID(),
      series: 3,
      micropausaSegundos: 60,
      macropausaSegundos: 90,
      repeticiones: 10,
      segundos: null,
      pesoKg: null,
    });
    const circuito = Circuito.reconstruir(randomUUID(), {
      vueltas: 3,
      macropausaSegundos: 60,
      ejercicios: [
        { ejercicioId: randomUUID(), repeticiones: null, segundos: 30, pesoKg: null },
        { ejercicioId: randomUUID(), repeticiones: 12, segundos: null, pesoKg: 20 },
      ],
    });
    original = Rutina.reconstruir(randomUUID(), profesor, [bloque], [circuito], 'Piernas', {
      bloques: [2],
      circuitos: [1],
    });
    await rutinas.guardar(original);
  });

  afterAll(async () => {
    if (!app) return;
    const conexion = app.get(DataSource);
    if (planId) await conexion.query('DELETE FROM planes WHERE id = $1', [planId]);
    await conexion.query('DELETE FROM rutinas WHERE profesor_usuario_id = $1', [profesor]);
    await app.close();
  });

  it('persiste la copia mixta sin alterar la original y permite renombrarlas por separado', async () => {
    const respuesta = await request(app.getHttpServer())
      .post(`/planificacion/rutinas/${original.id}/importacion`)
      .set('Authorization', `Bearer ${token}`);
    expect([respuesta.status, respuesta.body.nombre]).toEqual([201, 'Piernas - Copia']);
    copiaId = respuesta.body.id;
    const guardada = await rutinas.buscarPorId(copiaId);
    const intacta = await rutinas.buscarPorId(original.id);
    expect(guardada?.id).not.toBe(intacta?.id);
    expect(guardada?.bloques[0]?.id).not.toBe(intacta?.bloques[0]?.id);
    expect(guardada?.circuitos[0]?.id).not.toBe(intacta?.circuitos[0]?.id);
    expect(guardada?.elementos.map((e) => e.tipo)).toEqual(['circuito', 'bloque']);
    expect(guardada?.bloques[0]?.ejercicio).toEqual(intacta?.bloques[0]?.ejercicio);
    expect(guardada?.circuitos[0]?.ejercicios).toEqual(intacta?.circuitos[0]?.ejercicios);
    await request(app.getHttpServer())
      .patch(`/planificacion/rutinas/${copiaId}/nombre`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Piernas de Bruno' })
      .expect(200);
    expect((await rutinas.buscarPorId(original.id))?.nombre).toBe('Piernas');
    await request(app.getHttpServer())
      .patch(`/planificacion/rutinas/${original.id}/nombre`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Piernas de Ana' })
      .expect(200);
    expect((await rutinas.buscarPorId(copiaId))?.nombre).toBe('Piernas de Bruno');
  });

  it('rechaza rutina ajena, inexistente, alumno y ausencia de sesión', async () => {
    const ajena = await request(app.getHttpServer())
      .post(`/planificacion/rutinas/${original.id}/importacion`)
      .set('Authorization', `Bearer ${tokenOtro}`);
    const inexistente = await request(app.getHttpServer())
      .post(`/planificacion/rutinas/${randomUUID()}/importacion`)
      .set('Authorization', `Bearer ${token}`);
    const prohibida = await request(app.getHttpServer())
      .post(`/planificacion/rutinas/${original.id}/importacion`)
      .set('Authorization', `Bearer ${tokenAlumno}`);
    const sinSesion = await request(app.getHttpServer()).post(
      `/planificacion/rutinas/${original.id}/importacion`,
    );
    expect([
      [ajena.status, ajena.body.codigo],
      [inexistente.status, inexistente.body.codigo],
      [prohibida.status, prohibida.body.codigo],
      [sinSesion.status, sinSesion.body.codigo],
    ]).toEqual([
      [404, 'RN-PLAN-08'],
      [404, 'RN-PLAN-08'],
      [403, 'RN-IDE-03'],
      [401, 'RN-IDE-03'],
    ]);
    expect((await rutinas.listarPorProfesor(profesor, 1, 10)).total).toBe(2);
  });

  it('permite asignar la copia al primer día de un plan', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fechaInicio: '2030-01-01',
        alumnos: [alumno],
        dias: Array.from({ length: 28 }, (_, i) => ({
          numero: i + 1,
          rutinaId: i === 0 ? copiaId : null,
        })),
      });
    expect(respuesta.status).toBe(201);
    planId = respuesta.body.id;
    expect(respuesta.body.dias[0].rutinaId).toBe(copiaId);
  });
});
