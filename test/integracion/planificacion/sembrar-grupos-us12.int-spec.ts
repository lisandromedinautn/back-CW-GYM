import type { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import {
  REPOSITORIO_USUARIOS,
  type RepositorioUsuarios,
} from '../../../src/modulos/identidad/dominio/usuario/repositorio-usuarios.puerto.js';
import {
  REPOSITORIO_PROFESORES,
  type RepositorioProfesores,
} from '../../../src/modulos/identidad/dominio/profesor/repositorio-profesores.puerto.js';
import {
  REPOSITORIO_ALUMNOS,
  type RepositorioAlumnos,
} from '../../../src/modulos/identidad/dominio/alumno/repositorio-alumnos.puerto.js';
import { RepositorioPlanes } from '../../../src/modulos/planificacion/dominio/plan/repositorio-planes.puerto.js';
import { SembrarGruposUS12 } from '../../../src/semillas/sembrar-grupos-us12.js';

let app: INestApplicationContext;
const limpiar = async () => {
  const bd = app.get(DataSource);
  await bd.query(
    "DELETE FROM planes WHERE id IN ('12000000-0000-4000-8000-000000000101', '12000000-0000-4000-8000-000000000102')",
  );
  await bd.query(
    "DELETE FROM alumnos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('us12-alumno01@cwgym.test', 'us12-alumno02@cwgym.test', 'us12-alumno03@cwgym.test', 'us12-alumno04@cwgym.test'))",
  );
  await bd.query(
    "DELETE FROM profesores WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('us12-profesor01@cwgym.test', 'us12-profesor02@cwgym.test'))",
  );
  await bd.query(
    "DELETE FROM usuarios WHERE email IN ('us12-alumno01@cwgym.test', 'us12-alumno02@cwgym.test', 'us12-alumno03@cwgym.test', 'us12-alumno04@cwgym.test') OR email IN ('us12-profesor01@cwgym.test', 'us12-profesor02@cwgym.test')",
  );
};

beforeAll(async () => {
  app = await (await Test.createTestingModule({ imports: [ModuloRaiz] }).compile()).init();
  await limpiar();
});
afterAll(async () => {
  await limpiar();
  await app.close();
});

describe('Semilla de grupos US12', () => {
  it('crea dos profesores con alumnos vinculados y planes vigentes de 28 días', async () => {
    await new SembrarGruposUS12(
      app.get(DataSource),
      new Date('2026-11-22T12:00:00Z'),
      'clave-de-semilla',
    ).ejecutar();
    const usuarios = app.get<RepositorioUsuarios>(REPOSITORIO_USUARIOS);
    const profesores = app.get<RepositorioProfesores>(REPOSITORIO_PROFESORES);
    const alumnos = app.get<RepositorioAlumnos>(REPOSITORIO_ALUMNOS);
    const planes = app.get(RepositorioPlanes);
    const resumen: unknown[] = [];
    for (const numero of ['01', '02']) {
      const usuario = await usuarios.buscarPorEmail(`us12-profesor${numero}@cwgym.test`);
      expect(usuario).not.toBeNull();
      const profesor = await profesores.buscarPorUsuarioId(usuario!.id);
      expect(profesor).not.toBeNull();
      const vinculados = await alumnos.listarPorProfesor(profesor!.id);
      const listado = await planes.listarPorProfesor(
        usuario!.id,
        { hoy: '2026-11-22', estado: 'vigente' },
        1,
        10,
      );
      resumen.push([
        vinculados.length,
        listado.items.length,
        listado.items[0]?.dias.length,
        listado.items[0]?.alumnoIds.length,
      ]);
    }
    expect(resumen).toEqual([
      [2, 1, 28, 1],
      [2, 1, 28, 1],
    ]);
  });

  it('al repetir no duplica datos ni vuelve a asignar al alumno quitado', async () => {
    const semilla = new SembrarGruposUS12(
      app.get(DataSource),
      new Date('2026-11-22T12:00:00Z'),
      'clave-de-semilla',
    );
    const planes = app.get(RepositorioPlanes);
    await planes.quitarAlumno(
      '12000000-0000-4000-8000-000000000101',
      '12000000-0000-4000-8000-000000000301',
    );
    await semilla.ejecutar();
    const plan = await planes.buscarPorId('12000000-0000-4000-8000-000000000101');
    expect({ alumnos: plan?.alumnoIds, dias: plan?.dias.length }).toEqual({
      alumnos: [],
      dias: 28,
    });
    const usuarios = app.get<RepositorioUsuarios>(REPOSITORIO_USUARIOS);
    const usuario = await usuarios.buscarPorEmail('us12-profesor01@cwgym.test');
    const listado = await planes.listarPorProfesor(
      usuario!.id,
      { hoy: '2026-11-22', estado: 'vigente' },
      1,
      10,
    );
    expect(listado.total).toBe(1);
  });

  it('una colisión revierte toda la carga y conserva la cuenta previa', async () => {
    await limpiar();
    const bd = app.get(DataSource);
    await bd.query(
      'INSERT INTO usuarios (id, email, rol, hash_contrasenia) VALUES ($1, $2, $3, $4)',
      [
        '12000000-0000-4000-8000-000000000999',
        'us12-profesor02@cwgym.test',
        'Profesor',
        'hash-previo',
      ],
    );
    await expect(
      new SembrarGruposUS12(bd, new Date('2026-11-22T12:00:00Z'), 'clave-de-semilla').ejecutar(),
    ).rejects.toThrow('Conflicto con la cuenta us12-profesor02@cwgym.test');
    const usuarios = app.get<RepositorioUsuarios>(REPOSITORIO_USUARIOS);
    expect(await usuarios.buscarPorEmail('us12-profesor01@cwgym.test')).toBeNull();
    expect((await usuarios.buscarPorEmail('us12-profesor02@cwgym.test'))?.hashContrasenia).toBe(
      'hash-previo',
    );
  });
});
