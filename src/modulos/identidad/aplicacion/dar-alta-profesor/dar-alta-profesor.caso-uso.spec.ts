import { beforeEach, describe, expect, it } from 'vitest';
import {
  HasheadorFalso,
  RepositorioAlumnosEnMemoria,
  RepositorioProfesoresEnMemoria,
  RepositorioUsuariosEnMemoria,
} from '../../../../../test/dobles/identidad.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Alumno } from '../../dominio/alumno/alumno.entidad.js';
import { Documento } from '../../dominio/documento/documento.valor.js';
import { Rol } from '../../dominio/rol/rol.valor.js';
import { Usuario } from '../../dominio/usuario/usuario.entidad.js';
import { DarAltaProfesor, type DatosAltaProfesor } from './dar-alta-profesor.caso-uso.js';

const laura: DatosAltaProfesor = {
  nombre: 'Laura',
  apellido: 'Gómez',
  tipoDocumento: 'DNI',
  numeroDocumento: '30111222',
  legajo: 'P-001',
  email: 'laura@cwgym.test',
  contrasenia: 'Inicial123',
};

describe('US02 · el Admin da de alta un profesor', () => {
  let usuarios: RepositorioUsuariosEnMemoria;
  let profesores: RepositorioProfesoresEnMemoria;
  let alumnos: RepositorioAlumnosEnMemoria;
  let darAlta: DarAltaProfesor;

  beforeEach(() => {
    usuarios = new RepositorioUsuariosEnMemoria();
    profesores = new RepositorioProfesoresEnMemoria();
    alumnos = new RepositorioAlumnosEnMemoria();
    darAlta = new DarAltaProfesor(usuarios, profesores, alumnos, new HasheadorFalso());
  });

  const conflicto = (codigo: string) =>
    expect.objectContaining({ constructor: ErrorDominio, codigo, categoria: 'conflicto' });

  describe('RN-IDE-04 · el profesor tiene datos personales y legajo; el legajo es único', () => {
    it('con los datos de Laura (P-001) crea el profesor y su usuario con rol Profesor y contraseña hash(Inicial123)', async () => {
      const profesor = await darAlta.ejecutar(laura);

      expect([
        profesores.profesores.map((p) => [p.id, p.legajo, p.usuarioId]),
        usuarios.usuarios.map((u) => [u.id, u.email, u.rol.valor, u.hashContrasenia]),
      ]).toEqual([
        [[profesor.id, 'P-001', usuarios.usuarios[0]?.id]],
        [[profesor.usuarioId, 'laura@cwgym.test', 'Profesor', 'hash(Inicial123)']],
      ]);
    });

    it('con el legajo P-001 ya usado rechaza con 409 RN-IDE-04', async () => {
      await darAlta.ejecutar(laura);

      await expect(
        darAlta.ejecutar({ ...laura, numeroDocumento: '30999999', email: 'otra@cwgym.test' }),
      ).rejects.toThrow(conflicto('RN-IDE-04'));
    });
  });

  describe('RN-IDE-06 · no hay dos personas con el mismo tipo y número de documento', () => {
    it('con el DNI 30111222 de otro profesor rechaza con 409 RN-IDE-06', async () => {
      await darAlta.ejecutar(laura);

      await expect(
        darAlta.ejecutar({ ...laura, legajo: 'P-002', email: 'otra@cwgym.test' }),
      ).rejects.toThrow(conflicto('RN-IDE-06'));
    });

    it('con el DNI 30111222 de un alumno rechaza con 409 RN-IDE-06', async () => {
      await alumnos.guardar(
        Alumno.crear({
          usuarioId: 'u-9',
          nombre: 'Martín',
          apellido: 'Pérez',
          domicilio: 'Av. Colón 1234',
          documento: Documento.crear('DNI', '30111222'),
          salud: { alturaCm: 175, pesoKg: 75, edad: 24 },
        }),
      );

      await expect(darAlta.ejecutar(laura)).rejects.toThrow(conflicto('RN-IDE-06'));
    });
  });

  describe('RN-IDE-13 · el email es único entre todos los usuarios', () => {
    it('con el email del Admin rechaza con 409 RN-IDE-13 y no crea el profesor', async () => {
      await usuarios.guardar(
        Usuario.crear({
          email: 'admin@cwgym.test',
          hashContrasenia: 'H1',
          rol: Rol.desde('Admin'),
        }),
      );

      await expect(darAlta.ejecutar({ ...laura, email: 'admin@cwgym.test' })).rejects.toThrow(
        conflicto('RN-IDE-13'),
      );
      expect(profesores.profesores).toHaveLength(0);
    });
  });
});
