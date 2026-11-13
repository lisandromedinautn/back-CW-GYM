import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { ValidezPlan } from './validez-plan.valor.js';

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

const dia = (anio: number, mes: number, diaDelMes: number): Date =>
  new Date(Date.UTC(anio, mes - 1, diaDelMes));

describe('RN-PLAN-09 · la fecha de fin se calcula sola (inicio + 27 días)', () => {
  it('con inicio 13/11/2026, el fin es 10/12/2026', () => {
    expect(ValidezPlan.crear('2026-11-13').fin).toBe('2026-12-10');
  });

  it("una fecha inexistente ('2026-02-30') se rechaza con RN-PLAN-09", () => {
    expect(codigoDelError(() => ValidezPlan.crear('2026-02-30'))).toBe('RN-PLAN-09');
  });

  it("un formato inválido ('13/11/2026') se rechaza con RN-PLAN-09", () => {
    expect(codigoDelError(() => ValidezPlan.crear('13/11/2026'))).toBe('RN-PLAN-09');
  });
});

describe('RN-PLAN-11 · el día 1 es el inicio y el día 28 el fin', () => {
  const validez = ValidezPlan.crear('2026-11-13');

  it('el día 1 tiene la fecha de inicio y el día 28 la de fin', () => {
    expect([validez.fechaDelDia(1), validez.fechaDelDia(28)]).toEqual(['2026-11-13', '2026-12-10']);
  });
});

describe('RN-PLAN-15 · el plan está vigente entre inicio y fin, ambos incluidos', () => {
  const validez = ValidezPlan.crear('2026-11-13');

  it('no está vigente el día anterior al inicio', () => {
    expect(validez.estaVigente(dia(2026, 11, 12))).toBe(false);
  });

  it('está vigente el día de inicio', () => {
    expect(validez.estaVigente(dia(2026, 11, 13))).toBe(true);
  });

  it('está vigente el día de fin', () => {
    expect(validez.estaVigente(dia(2026, 12, 10))).toBe(true);
  });

  it('no está vigente el día siguiente al fin', () => {
    expect(validez.estaVigente(dia(2026, 12, 11))).toBe(false);
  });
});
