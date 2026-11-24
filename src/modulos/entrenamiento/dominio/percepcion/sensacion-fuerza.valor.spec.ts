import { describe, expect, it } from 'vitest';
import { SensacionFuerza } from './sensacion-fuerza.valor.js';

describe('RN-ENT-15 · la sensación de fuerza es un entero de 1 a 5', () => {
  it('1 y 5 son válidos', () => {
    expect(SensacionFuerza.crear(1).valor).toBe(1);
    expect(SensacionFuerza.crear(5).valor).toBe(5);
  });

  it.each([0, 6, 2.5])('%s se rechaza con RN-ENT-15', (valor) => {
    expect(() => SensacionFuerza.crear(valor)).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-ENT-15' }),
    );
  });
});
