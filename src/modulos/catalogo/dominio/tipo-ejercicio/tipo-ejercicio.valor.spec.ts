import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio.js';
import { TipoEjercicio } from './tipo-ejercicio.valor.js';

describe('RN-CAT-02 · el tipo de ejercicio es "por tiempo" o "por repeticiones"', () => {
  it('"por tiempo" es un tipo válido', () => {
    expect(TipoEjercicio.desde('por tiempo').valor).toBe('por tiempo');
  });

  it('"por repeticiones" es un tipo válido', () => {
    expect(TipoEjercicio.desde('por repeticiones').valor).toBe('por repeticiones');
  });

  it('"por distancia" se rechaza con RN-CAT-02', () => {
    expect(() => TipoEjercicio.desde('por distancia')).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-02' }),
    );
    expect(() => TipoEjercicio.desde('por distancia')).toThrow(ErrorDominio);
  });
});
