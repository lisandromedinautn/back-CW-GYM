import { describe, expect, it } from 'vitest';
import { FactorPesoCorporal } from './factor-peso-corporal.valor.js';

describe('RN-CAT-04 · el factor es mayor que 0% y hasta 100%', () => {
  it('0% se rechaza con RN-CAT-04', () => {
    expect(() => FactorPesoCorporal.crear(0)).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-04' }),
    );
  });

  it('0,5% es válido', () => {
    expect(FactorPesoCorporal.crear(0.5).porcentaje).toBe(0.5);
  });

  it('100% es válido', () => {
    expect(FactorPesoCorporal.crear(100).porcentaje).toBe(100);
  });

  it('100,1% se rechaza con RN-CAT-04', () => {
    expect(() => FactorPesoCorporal.crear(100.1)).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-04' }),
    );
  });

  it('sin indicar el factor, vale 100%', () => {
    expect(FactorPesoCorporal.crear().porcentaje).toBe(100);
  });
});
