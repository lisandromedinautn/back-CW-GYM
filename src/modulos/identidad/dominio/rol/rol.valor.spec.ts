import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Rol } from './rol.valor.js';

describe('RN-IDE-02 · cada usuario tiene exactamente un rol: Admin, Profesor o Alumno', () => {
  it.each(['Admin', 'Profesor', 'Alumno'])('acepta el rol %s', (valor) => {
    expect(Rol.desde(valor).valor).toBe(valor);
  });

  it('rechaza el rol "SuperAdmin" con el código RN-IDE-02', () => {
    expect(() => Rol.desde('SuperAdmin')).toThrow(
      expect.objectContaining({ constructor: ErrorDominio, codigo: 'RN-IDE-02' }),
    );
  });
});
