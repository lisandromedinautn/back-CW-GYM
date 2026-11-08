import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Documento } from '../documento/documento.valor.js';
import { Profesor } from './profesor.entidad.js';

describe('RN-IDE-04 · el profesor tiene datos personales y legajo', () => {
  const datos = {
    usuarioId: 'u-1',
    nombre: 'Laura',
    apellido: 'Gómez',
    documento: Documento.crear('DNI', '30111222'),
    legajo: 'P-001',
  };

  it('con legajo P-001 se crea', () => {
    expect(Profesor.crear(datos).legajo).toBe('P-001');
  });

  it('con el legajo vacío rechaza con RN-IDE-04', () => {
    expect(() => Profesor.crear({ ...datos, legajo: '' })).toThrow(
      expect.objectContaining({ constructor: ErrorDominio, codigo: 'RN-IDE-04' }),
    );
  });
});
