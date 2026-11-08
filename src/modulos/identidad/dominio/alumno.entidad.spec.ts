import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { Alumno } from './alumno.entidad.js';
import { Documento } from './documento.valor.js';

const datos = {
  usuarioId: 'u-2',
  nombre: 'Martín',
  apellido: 'Pérez',
  domicilio: 'Av. Colón 1234, Córdoba',
  documento: Documento.crear('DNI', '40000001'),
  salud: { alturaCm: 175, pesoKg: 75, edad: 24 },
};

describe('RN-IDE-05 · el alumno tiene datos personales y de salud', () => {
  it('con todos los datos se crea con su peso de 75 kg', () => {
    expect(Alumno.crear(datos).salud.pesoKg).toBe(75);
  });

  it('sin domicilio rechaza con RN-IDE-05', () => {
    expect(() => Alumno.crear({ ...datos, domicilio: '' })).toThrow(
      expect.objectContaining({ constructor: ErrorDominio, codigo: 'RN-IDE-05' }),
    );
  });
});

describe('RN-IDE-07 · el peso no tiene historial: un cambio sobrescribe el anterior', () => {
  it('con 75 kg, actualizarPeso(80) deja el peso en 80 kg', () => {
    const alumno = Alumno.crear(datos);

    alumno.actualizarPeso(80);

    expect(alumno.salud.pesoKg).toBe(80);
  });
});
