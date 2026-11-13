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
