import type { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { RepositorioPlanes } from '../../../src/modulos/planificacion/dominio/plan/repositorio-planes.puerto.js';
import { RepositorioRutinas } from '../../../src/modulos/planificacion/dominio/rutina/repositorio-rutinas.puerto.js';
import { SembrarGruposUS12 } from '../../../src/semillas/sembrar-grupos-us12.js';
import { CompletarPlanUS12 } from '../../../src/semillas/completar-plan-us12.js';

let app: INestApplicationContext;
const planId = '12000000-0000-4000-8000-000000000101';
const alumnoId = '12000000-0000-4000-8000-000000000301';
const limpiar = async () => {
  const bd = app.get(DataSource);
  await bd.query(
    "DELETE FROM planes WHERE id IN ('12000000-0000-4000-8000-000000000101', '12000000-0000-4000-8000-000000000102')",
  );
  await bd.query("DELETE FROM rutinas WHERE id = '12000000-0000-4000-8000-000000000401'");
  await bd.query(
    "DELETE FROM alumnos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('us12-alumno01@cwgym.test', 'us12-alumno02@cwgym.test', 'us12-alumno03@cwgym.test', 'us12-alumno04@cwgym.test'))",
  );
  await bd.query(
    "DELETE FROM profesores WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('us12-profesor01@cwgym.test', 'us12-profesor02@cwgym.test'))",
  );
  await bd.query(
    "DELETE FROM usuarios WHERE email IN ('us12-alumno01@cwgym.test', 'us12-alumno02@cwgym.test', 'us12-alumno03@cwgym.test', 'us12-alumno04@cwgym.test', 'us12-profesor01@cwgym.test', 'us12-profesor02@cwgym.test')",
  );
};

beforeAll(async () => {
  const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
    .overrideProvider(FuenteDatasetEjercicios)
    .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
    .compile();
  app = await modulo.init();
  await limpiar();
  await app.get(CargarDatasetEjercicios).ejecutar();
  await new SembrarGruposUS12(
    app.get(DataSource),
    new Date('2026-11-22T12:00:00Z'),
    'clave-de-semilla',
  ).ejecutar();
});
afterAll(async () => {
  await limpiar();
  await app.close();
});

describe('Completar plan de prueba US12', () => {
  it('asigna ejercicios a los 28 días y conserva las fechas y el alumno', async () => {
    const planes = app.get(RepositorioPlanes);
    await new CompletarPlanUS12(app.get(DataSource), new Date('2026-11-22T12:00:00Z')).ejecutar();
    const plan = await planes.buscarPorId(planId);
    expect(plan?.alumnoIds).toEqual([alumnoId]);
    expect([plan?.fechaInicio, plan?.fechaFin]).toEqual(['2026-11-22', '2026-12-19']);
    expect(plan?.dias.filter((dia) => dia.rutinaId !== null)).toHaveLength(28);
    const rutina = await app.get(RepositorioRutinas).buscarPorId(plan!.dias[0].rutinaId!);
    expect(rutina?.bloques.length).toBeGreaterThanOrEqual(2);
  });
  it('al repetir no duplica y rechaza una modificación ajena sin sobrescribirla', async () => {
    const bd = app.get(DataSource);
    const completar = new CompletarPlanUS12(bd, new Date('2026-11-22T12:00:00Z'));
    await completar.ejecutar();
    const rutinas = await bd.query(
      "SELECT count(*)::int AS total FROM rutinas WHERE id = '12000000-0000-4000-8000-000000000401'",
    );
    expect(rutinas[0].total).toBe(1);
    await bd.query(
      "UPDATE dias_plan SET rutina_id = '12000000-0000-4000-8000-000000000402' WHERE plan_id = $1 AND numero = 1",
      [planId],
    );
    await expect(completar.ejecutar()).rejects.toThrow('ya fueron modificados');
    const plan = await app.get(RepositorioPlanes).buscarPorId(planId);
    expect(plan?.dias.find((dia) => dia.numero === 1)?.rutinaId).toBe(
      '12000000-0000-4000-8000-000000000402',
    );
  });
});
