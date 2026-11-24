import { describe, expect, it } from 'vitest';
import { Percepcion } from './percepcion.valor.js';

describe('RN-NOT-06 · la percepción es mala con RPE 9 o más, o sensación de fuerza 2 o menos', () => {
  it('9/3, 7/2, 10/1 y 8/3 → mala, mala, mala y no mala', () => {
    const resultado = [
      Percepcion.crear({ rpe: 9, sensacionFuerza: 3 }),
      Percepcion.crear({ rpe: 7, sensacionFuerza: 2 }),
      Percepcion.crear({ rpe: 10, sensacionFuerza: 1 }),
      Percepcion.crear({ rpe: 8, sensacionFuerza: 3 }),
    ].map((p) => p.esMala());
    expect(resultado).toEqual([true, true, true, false]);
  });
});
