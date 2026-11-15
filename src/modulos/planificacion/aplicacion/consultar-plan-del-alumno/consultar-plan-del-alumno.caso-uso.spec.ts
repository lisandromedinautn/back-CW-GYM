import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import {
  ConsultaNombresEjerciciosFalsa,
  ConsultaVinculosFalsa,
  RelojFijo,
  RepositorioPlanesEnMemoria,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ConsultarPlanDelAlumno } from './consultar-plan-del-alumno.caso-uso.js';

const PRESS = { id: 'press', porTiempo: false, admitePesoExtra: true };
const PLANCHA = { id: 'plancha', porTiempo: true, admitePesoExtra: false };

describe('RN-PLAN-11, 19 · el alumno consulta su plan completo de 28 días', () => {
  let planes: RepositorioPlanesEnMemoria;
  let rutinas: RepositorioRutinasEnMemoria;

  beforeEach(() => {
    planes = new RepositorioPlanesEnMemoria();
    rutinas = new RepositorioRutinasEnMemoria();
  });

  const consultar = (fecha = '2026-11-14') =>
    new ConsultarPlanDelAlumno(
      planes,
      rutinas,
      new ConsultaVinculosFalsa([], { 'u-ana': 'a-ana', 'u-bruno': 'a-bruno' }),
      new ConsultaNombresEjerciciosFalsa({ press: 'Press de pecho', plancha: 'Plancha' }),
      new RelojFijo(new Date(`${fecha}T12:00:00Z`)),
    );

  async function asignarPlan(alumnoId = 'a-ana', rutinaId: string | null = null) {
    const plan = Plan.crear({
      profesorUsuarioId: 'u-profesor',
      fechaInicio: '2026-11-01',
      alumnoIds: [alumnoId],
      dias: Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId })),
    });
    await planes.guardar(plan);
    return plan;
  }

  it('devuelve los 28 días ordenados con fechas, rutinas completas y descansos', async () => {
    const piernas = Rutina.crear({
      profesorUsuarioId: 'u-profesor',
      nombre: 'Piernas',
      bloques: [
        {
          ejercicio: PRESS,
          series: 3,
          repeticiones: 10,
          pesoKg: 20,
          micropausaSegundos: 60,
          macropausaSegundos: 120,
        },
      ],
    });
    const circuito = Rutina.crear({
      profesorUsuarioId: 'u-profesor',
      nombre: 'Circuito',
      circuitos: [
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [
            { ejercicio: PRESS, repeticiones: 10, pesoKg: 20 },
            { ejercicio: PLANCHA, segundos: 30 },
          ],
        },
      ],
    });
    await rutinas.guardar(piernas);
    await rutinas.guardar(circuito);
    await planes.guardar(
      Plan.reconstruir({
        id: 'plan-ana',
        profesorUsuarioId: 'u-profesor',
        fechaInicio: '2026-11-01',
        fechaFin: '2026-11-28',
        alumnoIds: ['a-ana', 'a-otro'],
        dias: Array.from({ length: 28 }, (_, indice) => ({
          numero: indice + 1,
          rutinaId: indice === 0 ? piernas.id : indice === 27 ? circuito.id : null,
        })).reverse(),
      }),
    );

    const resultado = await consultar().ejecutar('u-ana');

    expect(resultado).toMatchObject({
      estado: 'plan',
      fecha: '2026-11-14',
      plan: { id: 'plan-ana', fechaInicio: '2026-11-01', fechaFin: '2026-11-28' },
    });
    if (resultado.estado !== 'plan') throw new Error('Se esperaba el plan completo');
    expect(Object.keys(resultado.plan).sort()).toEqual(['dias', 'fechaFin', 'fechaInicio', 'id']);
    expect(resultado.plan.dias.map(({ numero, fecha }) => [numero, fecha])).toEqual([
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
    expect(resultado.plan.dias[0].rutina).toEqual({
      id: piernas.id,
      nombre: 'Piernas',
      tipo: 'Bloques',
      bloques: [
        {
          ejercicioId: 'press',
          nombre: 'Press de pecho',
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
    expect(resultado.plan.dias.slice(1, 27).every((dia) => dia.rutina === null)).toBe(true);
    expect(resultado.plan.dias[27].rutina).toEqual({
      id: circuito.id,
      nombre: 'Circuito',
      tipo: 'Circuitos',
      bloques: [],
      circuitos: [
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [
            {
              ejercicioId: 'press',
              nombre: 'Press de pecho',
              repeticiones: 10,
              segundos: null,
              pesoKg: 20,
            },
            {
              ejercicioId: 'plancha',
              nombre: 'Plancha',
              repeticiones: null,
              segundos: 30,
              pesoKg: null,
            },
          ],
        },
      ],
    });
  });
  it('sin plan asignado informa sin-plan', async () => {
    expect(await consultar().ejecutar('u-ana')).toEqual({
      estado: 'sin-plan',
      fecha: '2026-11-14',
    });
  });

  it('sin ficha de alumno informa sin-plan', async () => {
    await asignarPlan();

    expect(await consultar().ejecutar('u-sin-ficha')).toEqual({
      estado: 'sin-plan',
      fecha: '2026-11-14',
    });
  });

  it('no muestra el plan de otro alumno', async () => {
    await asignarPlan();

    expect(await consultar().ejecutar('u-bruno')).toEqual({
      estado: 'sin-plan',
      fecha: '2026-11-14',
    });
  });

  it('cada alumno obtiene su propio plan', async () => {
    await asignarPlan();
    const deBruno = await asignarPlan('a-bruno');

    expect(await consultar().ejecutar('u-bruno')).toMatchObject({
      estado: 'plan',
      plan: { id: deBruno.id },
    });
  });

  it.each(['2026-11-01', '2026-11-28'])(
    'incluye ambos extremos de vigencia: %s (RN-PLAN-15)',
    async (fecha) => {
      await asignarPlan();

      const resultado = await consultar(fecha).ejecutar('u-ana');

      expect(resultado).toMatchObject({
        estado: 'plan',
        fecha,
        plan: { fechaInicio: '2026-11-01', fechaFin: '2026-11-28' },
      });
      if (resultado.estado !== 'plan') throw new Error('Se esperaba el plan completo');
      expect(resultado.plan.dias).toHaveLength(28);
      expect(resultado.plan.dias[0]).toEqual({ numero: 1, fecha: '2026-11-01', rutina: null });
      expect(resultado.plan.dias[27]).toEqual({ numero: 28, fecha: '2026-11-28', rutina: null });
    },
  );

  it.each(['2026-10-31', '2026-11-29'])(
    'fuera de vigencia informa sin-plan: %s (RN-PLAN-15)',
    async (fecha) => {
      await asignarPlan();

      expect(await consultar(fecha).ejecutar('u-ana')).toEqual({ estado: 'sin-plan', fecha });
    },
  );

  it('una rutina inexistente no se presenta como descanso (RN-PLAN-08)', async () => {
    await asignarPlan('a-ana', 'rutina-inexistente');

    const resultado = consultar().ejecutar('u-ana');

    await expect(resultado).rejects.toBeInstanceOf(ErrorDominio);
    await expect(resultado).rejects.toMatchObject({
      codigo: 'RN-PLAN-08',
      categoria: 'no-encontrado',
    });
  });
});
