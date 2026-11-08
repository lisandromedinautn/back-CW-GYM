import { beforeEach, describe, expect, it } from 'vitest';
import {
  PublicadorEventosFalso,
  RepositorioAlumnosEnMemoria,
  RepositorioProfesoresEnMemoria,
} from '../../../../test/dobles/identidad.js';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { Alumno } from '../dominio/alumno.entidad.js';
import { Documento } from '../dominio/documento.valor.js';
import { Profesor } from '../dominio/profesor.entidad.js';
import { VincularAlumno } from './vincular-alumno.caso-uso.js';

describe('US05 · el alumno se vincula con su profesor ingresando el código', () => {
  let alumnos: RepositorioAlumnosEnMemoria;
  let profesores: RepositorioProfesoresEnMemoria;
  let publicador: PublicadorEventosFalso;
  let vincular: VincularAlumno;
  let laura: Profesor;
  let martin: Alumno;

  beforeEach(async () => {
    alumnos = new RepositorioAlumnosEnMemoria();
    profesores = new RepositorioProfesoresEnMemoria();
    publicador = new PublicadorEventosFalso();
    vincular = new VincularAlumno(alumnos, profesores, publicador);
    laura = Profesor.crear({
      usuarioId: 'u-laura',
      nombre: 'Laura',
      apellido: 'Gómez',
      documento: Documento.crear('DNI', '30111222'),
      legajo: 'P-001',
    });
    laura.asignarCodigo('ABC234');
    await profesores.guardar(laura);
    martin = Alumno.crear({
      usuarioId: 'u-martin',
      nombre: 'Martín',
      apellido: 'Pérez',
      domicilio: 'Av. Colón 1234',
      documento: Documento.crear('DNI', '40000001'),
      salud: { alturaCm: 175, pesoKg: 75, edad: 24 },
    });
    await alumnos.guardar(martin);
  });

  const errorDe = (codigo: string) =>
    expect.objectContaining({ constructor: ErrorDominio, codigo });

  describe('RN-IDE-09 · con un código válido queda vinculado al profesor que lo generó y se emite AlumnoVinculado', () => {
    it('con ABC234 Martín queda vinculado a Laura y devuelve su nombre', async () => {
      const resultado = await vincular.ejecutar('u-martin', 'ABC234');

      expect([resultado, (await alumnos.buscarPorUsuarioId('u-martin'))?.profesorId]).toEqual([
        { profesor: { nombre: 'Laura', apellido: 'Gómez' } },
        laura.id,
      ]);
    });

    it('emite AlumnoVinculado con el alumno y el profesor', async () => {
      await vincular.ejecutar('u-martin', 'ABC234');

      expect(publicador.eventos).toEqual([
        { nombre: 'AlumnoVinculado', alumnoId: martin.id, profesorId: laura.id },
      ]);
    });

    it('con " abc234 " (minúsculas y espacios) vincula igual', async () => {
      await vincular.ejecutar('u-martin', ' abc234 ');

      expect((await alumnos.buscarPorUsuarioId('u-martin'))?.profesorId).toBe(laura.id);
    });
  });

  describe('RN-IDE-10 · un alumno que ya tiene profesor no se puede vincular a otro', () => {
    it('vincularse dos veces rechaza con 409 RN-IDE-10 y emite un solo evento', async () => {
      await vincular.ejecutar('u-martin', 'ABC234');

      await expect(vincular.ejecutar('u-martin', 'ABC234')).rejects.toThrow(
        expect.objectContaining({ codigo: 'RN-IDE-10', categoria: 'conflicto' }),
      );
      expect(publicador.eventos).toHaveLength(1);
    });
  });

  describe('RN-IDE-11 · un código inexistente o invalidado no vincula', () => {
    it('con NOEXIS rechaza con RN-IDE-11 "El código de profesor no es válido"', async () => {
      await expect(vincular.ejecutar('u-martin', 'NOEXIS')).rejects.toThrow(
        expect.objectContaining({
          constructor: ErrorDominio,
          codigo: 'RN-IDE-11',
          message: 'El código de profesor no es válido',
        }),
      );
    });

    it('con ABC234 después de que Laura regeneró su código rechaza con RN-IDE-11', async () => {
      laura.asignarCodigo('XYZ789');
      await profesores.guardar(laura);

      await expect(vincular.ejecutar('u-martin', 'ABC234')).rejects.toThrow(errorDe('RN-IDE-11'));
    });
  });
});
