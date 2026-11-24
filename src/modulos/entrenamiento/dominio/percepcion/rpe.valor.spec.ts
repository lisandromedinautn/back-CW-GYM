import { describe, expect, it } from 'vitest';
import { Rpe } from './rpe.valor.js';

describe('RN-ENT-14 · el RPE es un entero de 1 a 10', () => {
  it('1 y 10 son válidos', () => {
    expect(Rpe.crear(1).valor).toBe(1);
    expect(Rpe.crear(10).valor).toBe(10);
  });

  it.each([0, 11, 7.5])('%s se rechaza con RN-ENT-14', (valor) => {
    expect(() => Rpe.crear(valor)).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-ENT-14' }),
    );
  });
});
