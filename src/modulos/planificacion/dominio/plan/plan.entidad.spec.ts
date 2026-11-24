import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { type DatosDiaPlan, type DatosPlan, Plan } from './plan.entidad.js';

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

const dias = (rutinaId: string | null = null): DatosDiaPlan[] =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const datos = (cambios: Partial<DatosPlan> = {}): DatosPlan => ({
  profesorUsuarioId: 'u-laura',
  fechaInicio: '2026-11-13',
  dias: dias(),
  alumnoIds: ['a1'],
  ...cambios,
});

describe('RN-PLAN-09 · el plan tiene 28 días y la fecha de fin calculada', () => {
  it('con 27 días se rechaza con RN-PLAN-09', () => {
    expect(codigoDelError(() => Plan.crear(datos({ dias: dias().slice(0, 27) })))).toBe(
      'RN-PLAN-09',
    );
  });

  it('con inicio 13/11/2026 la fecha de fin es 10/12/2026', () => {
    expect(Plan.crear(datos()).fechaFin).toBe('2026-12-10');
  });
});

describe('RN-PLAN-11 · cada día tiene su número y su fecha', () => {
  it('un día 29 se rechaza con RN-PLAN-11', () => {
    const conDia29 = dias().map((dia) => (dia.numero === 28 ? { ...dia, numero: 29 } : dia));
    expect(codigoDelError(() => Plan.crear(datos({ dias: conDia29 })))).toBe('RN-PLAN-11');
  });

  it('un número de día repetido se rechaza con RN-PLAN-11', () => {
    const repetido = dias().map((dia) => (dia.numero === 28 ? { ...dia, numero: 27 } : dia));
    expect(codigoDelError(() => Plan.crear(datos({ dias: repetido })))).toBe('RN-PLAN-11');
  });

  it('ordena los días y les asigna la fecha que sale del inicio', () => {
    const desordenados = [...dias()].reverse();
    const plan = Plan.crear(datos({ dias: desordenados }));

    expect([plan.dias[0].numero, plan.dias[0].fecha]).toEqual([1, '2026-11-13']);
    expect([plan.dias[27].numero, plan.dias[27].fecha]).toEqual([28, '2026-12-10']);
  });
});

describe('RN-PLAN-10 · cada día tiene una rutina o es de descanso', () => {
  it('un día sin rutina es de descanso', () => {
    expect(Plan.crear(datos()).dias[0].esDescanso).toBe(true);
  });

  it('un día con rutina no es de descanso', () => {
    const plan = Plan.crear(datos({ dias: dias('r1') }));
    expect(plan.dias[0].esDescanso).toBe(false);
  });
});

describe('RN-PLAN-12 · el plan se crea con al menos un alumno', () => {
  it('sin alumnos se rechaza con RN-PLAN-12', () => {
    expect(codigoDelError(() => Plan.crear(datos({ alumnoIds: [] })))).toBe('RN-PLAN-12');
  });

  it('un alumno repetido queda una sola vez', () => {
    expect(Plan.crear(datos({ alumnoIds: ['a1', 'a1'] })).alumnoIds).toEqual(['a1']);
  });
});

// Plan de ejemplo de US22: inicio 21/11/2026 (día 1), día 4 = 24/11 = hoy, día 10 = 30/11.
const HOY = '2026-11-24';
const RUTINA_PROPIA = 'r-propia';

const diaDel = (plan: Plan, numero: number) => plan.dias.find((dia) => dia.numero === numero);

describe('RN-PLAN-23 · el profesor edita los días de un plan que no terminó', () => {
  it('P1 un día futuro cambia a la rutina indicada', () => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-11-21', dias: dias() }));

    plan.editarDia(10, RUTINA_PROPIA, HOY);

    expect(diaDel(plan, 10)?.rutinaId).toBe(RUTINA_PROPIA);
  });

  it('P2 un día futuro pasa a descanso con null', () => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-11-21', dias: dias(RUTINA_PROPIA) }));

    plan.editarDia(10, null, HOY);

    expect(diaDel(plan, 10)?.esDescanso).toBe(true);
  });

  it('P3 un día con fecha anterior a hoy se rechaza con RN-PLAN-23', () => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-11-21', dias: dias() }));

    expect(codigoDelError(() => plan.editarDia(2, RUTINA_PROPIA, HOY))).toBe('RN-PLAN-23');
  });

  it('P4 el día de hoy sin entrenamiento iniciado cambia a la rutina indicada', () => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-11-21', dias: dias() }));

    plan.editarDia(4, RUTINA_PROPIA, HOY);

    expect(diaDel(plan, 4)?.rutinaId).toBe(RUTINA_PROPIA);
  });

  it('P5 un plan que ya terminó no se edita: se rechaza con RN-PLAN-23', () => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-10-01', dias: dias() }));

    expect(codigoDelError(() => plan.editarDia(20, RUTINA_PROPIA, HOY))).toBe('RN-PLAN-23');
  });

  it.each([0, 29])('P6 el día %i no existe en el plan y se rechaza con RN-PLAN-11', (numero) => {
    const plan = Plan.crear(datos({ fechaInicio: '2026-11-21', dias: dias() }));

    expect(codigoDelError(() => plan.editarDia(numero, RUTINA_PROPIA, HOY))).toBe('RN-PLAN-11');
  });
});
