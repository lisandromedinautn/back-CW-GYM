import { describe, expect, it } from 'vitest';
import { Musculo } from './musculo.valor.js';

describe('RN-CAT-05 · el músculo es de una lista cerrada y el grupo muscular se deriva de él', () => {
  it.each([
    ['Cuádriceps', 'Piernas'],
    ['Pectoral', 'Pecho'],
    ['Aductores', 'Piernas'],
    ['Serrato', 'Pecho'],
    ['Elevador de la escápula', 'Espalda'],
  ])('%s pertenece al grupo %s', (nombre, grupo) => {
    expect(Musculo.desde(nombre).grupo).toBe(grupo);
  });

  it('"Cuello" se rechaza con RN-CAT-05', () => {
    expect(() => Musculo.desde('Cuello')).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-05' }),
    );
  });
});
