import { describe, expect, it } from 'vitest';
import {
  ConsultaVinculosFalsa,
  RepositorioPlanesEnMemoria,
  RelojFijo,
} from '../../../../../test/dobles/planificacion.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { AlumnosDelPlan } from './alumnos-del-plan.caso-uso.js';

async function preparar(fecha = '2026-11-14') {
  const planes = new RepositorioPlanesEnMemoria();
  const plan = Plan.crear({
    profesorUsuarioId: 'profesor',
    fechaInicio: '2026-11-01',
    alumnoIds: ['a1'],
    dias: Array.from({ length: 28 }, (_, i) => ({ numero: i + 1, rutinaId: null })),
  });
  await planes.guardar(plan);
  const vinculos = new ConsultaVinculosFalsa([{ alumnoId: 'a2', profesorUsuarioId: 'profesor' }]);
  return {
    planes,
    plan,
    caso: new AlumnosDelPlan(planes, vinculos, new RelojFijo(new Date(`${fecha}T00:00:00Z`))),
  };
}

describe('US12 · alumnos de un plan vigente', () => {
  it('agrega un alumno vinculado y quita al último', async () => {
    const { caso, planes, plan } = await preparar();
    await caso.agregar('profesor', plan.id, 'a2');
    await caso.quitar('profesor', plan.id, 'a1');
    await caso.quitar('profesor', plan.id, 'a2');
    expect((await planes.buscarPorId(plan.id))?.alumnoIds).toEqual([]);
  });
  it('rechaza alumno no vinculado con RN-PLAN-13', async () => {
    const { caso, plan } = await preparar();
    await expect(caso.agregar('profesor', plan.id, 'ajeno')).rejects.toMatchObject({
      codigo: 'RN-PLAN-13',
    });
  });
  it('rechaza alumno con otro plan vigente con RN-PLAN-14', async () => {
    const { caso, plan, planes } = await preparar();
    await planes.guardar(
      Plan.crear({
        profesorUsuarioId: 'profesor',
        fechaInicio: '2026-11-01',
        alumnoIds: ['a2'],
        dias: Array.from({ length: 28 }, (_, i) => ({ numero: i + 1, rutinaId: null })),
      }),
    );
    await expect(caso.agregar('profesor', plan.id, 'a2')).rejects.toMatchObject({
      codigo: 'RN-PLAN-14',
    });
  });
  it.each(['2026-11-01', '2026-11-28'])('permite cambiar alumnos el %s', async (fecha) => {
    const { caso, plan, planes } = await preparar(fecha);
    await caso.agregar('profesor', plan.id, 'a2');
    await caso.quitar('profesor', plan.id, 'a1');
    expect((await planes.buscarPorId(plan.id))?.alumnoIds).toEqual(['a2']);
  });
  it.each(['2026-10-31', '2026-11-29'])(
    'rechaza cambios fuera de vigencia el %s',
    async (fecha) => {
      const { caso, plan } = await preparar(fecha);
      await expect(caso.agregar('profesor', plan.id, 'a2')).rejects.toMatchObject({
        codigo: 'RN-PLAN-16',
      });
      await expect(caso.quitar('profesor', plan.id, 'a1')).rejects.toMatchObject({
        codigo: 'RN-PLAN-16',
      });
    },
  );
  it('no permite modificar el plan de otro profesor', async () => {
    const { caso, plan } = await preparar();
    await expect(caso.quitar('otro', plan.id, 'a1')).rejects.toMatchObject({
      codigo: 'RN-PLAN-16',
      categoria: 'no-encontrado',
    });
  });
});
