import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio.js';
import { Documento } from './documento.valor.js';

describe('RN-IDE-06 · el Documento es un objeto de valor de tipo y número', () => {
  it('acepta DNI 30111222', () => {
    const documento = Documento.crear('DNI', '30111222');

    expect([documento.tipo, documento.numero]).toEqual(['DNI', '30111222']);
  });

  it.each(['DNI', 'LC', 'LE', 'Pasaporte'])('acepta el tipo %s', (tipo) => {
    expect(Documento.crear(tipo, '123').tipo).toBe(tipo);
  });

  it('rechaza el tipo CUIT con RN-IDE-06', () => {
    expect(() => Documento.crear('CUIT', '20301112223')).toThrow(
      expect.objectContaining({ constructor: ErrorDominio, codigo: 'RN-IDE-06' }),
    );
  });

  it('rechaza un número vacío con RN-IDE-06', () => {
    expect(() => Documento.crear('DNI', '  ')).toThrow(
      expect.objectContaining({ constructor: ErrorDominio, codigo: 'RN-IDE-06' }),
    );
  });
});
