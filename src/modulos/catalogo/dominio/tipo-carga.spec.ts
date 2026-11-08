import { describe, expect, it } from 'vitest';
import { TipoCarga } from './tipo-carga.js';

describe('RN-CAT-03 · el tipo de carga es Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra', () => {
  it.each(['Sin Peso', 'Peso Corporal', 'Peso Extra', 'Peso Corporal + Peso Extra'])(
    '"%s" es un tipo de carga válido',
    (texto) => {
      expect(TipoCarga.desde(texto).valor).toBe(texto);
    },
  );

  it('"Mancuerna" se rechaza con RN-CAT-03', () => {
    expect(() => TipoCarga.desde('Mancuerna')).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-03' }),
    );
  });
});
