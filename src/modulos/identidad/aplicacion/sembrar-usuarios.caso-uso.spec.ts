import { beforeEach, describe, expect, it } from 'vitest';
import {
  HasheadorFalso,
  RepositorioAlumnosEnMemoria,
  RepositorioProfesoresEnMemoria,
  RepositorioUsuariosEnMemoria,
} from '../../../../test/dobles/identidad.js';
import { Alumno } from '../dominio/alumno.entidad.js';
import { Documento } from '../dominio/documento.valor.js';
import { Profesor } from '../dominio/profesor.entidad.js';
import { Rol } from '../dominio/rol.valor.js';
import { Usuario } from '../dominio/usuario.entidad.js';
import { SembrarUsuarios } from './sembrar-usuarios.caso-uso.js';

describe('RN-IDE-12 · la semilla crea 3 profesores y 20 alumnos con la contraseña de SEMILLA_CONTRASENIA, sin duplicar', () => {
  let usuarios: RepositorioUsuariosEnMemoria;
  let profesores: RepositorioProfesoresEnMemoria;
  let alumnos: RepositorioAlumnosEnMemoria;

  beforeEach(() => {
    usuarios = new RepositorioUsuariosEnMemoria();
    profesores = new RepositorioProfesoresEnMemoria();
    alumnos = new RepositorioAlumnosEnMemoria();
  });

  const semilla = (contrasenia?: string) =>
    new SembrarUsuarios(usuarios, profesores, alumnos, new HasheadorFalso(), { contrasenia });

  it('con Gimnasio123 crea los profesores P-001 a P-003 con sus emails profesor01..03@cwgym.test', async () => {
    await semilla('Gimnasio123').ejecutar();

    expect(profesores.profesores.map((p) => p.legajo)).toEqual(['P-001', 'P-002', 'P-003']);
    expect(usuarios.usuarios.filter((u) => u.rol.valor === 'Profesor').map((u) => u.email)).toEqual(
      ['profesor01@cwgym.test', 'profesor02@cwgym.test', 'profesor03@cwgym.test'],
    );
  });

  it('crea 20 alumnos sin profesor, del alumno01@cwgym.test al alumno20@cwgym.test', async () => {
    await semilla('Gimnasio123').ejecutar();

    const emails = usuarios.usuarios.filter((u) => u.rol.valor === 'Alumno').map((u) => u.email);
    expect([emails.length, emails[0], emails[19]]).toEqual([
      20,
      'alumno01@cwgym.test',
      'alumno20@cwgym.test',
    ]);
    expect(alumnos.alumnos.every((a) => a.profesorId === null)).toBe(true);
  });

  it('los 23 usuarios quedan con la contraseña hasheada hash(Gimnasio123)', async () => {
    await semilla('Gimnasio123').ejecutar();

    expect(new Set(usuarios.usuarios.map((u) => u.hashContrasenia))).toEqual(
      new Set(['hash(Gimnasio123)']),
    );
    expect(usuarios.usuarios).toHaveLength(23);
  });

  it('ejecutarla dos veces deja 23 usuarios', async () => {
    await semilla('Gimnasio123').ejecutar();
    await semilla('Gimnasio123').ejecutar();

    expect(usuarios.usuarios).toHaveLength(23);
  });

  it('si ya existe un alumno con el DNI 40000001 de la semilla, no lo duplica', async () => {
    await alumnos.guardar(
      Alumno.crear({
        usuarioId: 'otro',
        nombre: 'Ya',
        apellido: 'Existía',
        domicilio: 'Calle 1',
        documento: Documento.crear('DNI', '40000001'),
        salud: { alturaCm: 170, pesoKg: 70, edad: 30 },
      }),
    );

    await semilla('Gimnasio123').ejecutar();

    expect(
      alumnos.alumnos.filter((a) => a.documento.igualA(Documento.crear('DNI', '40000001'))),
    ).toHaveLength(1);
  });

  it('si ya existe un profesor con el DNI 30000001 de la semilla, no lo duplica', async () => {
    await profesores.guardar(
      Profesor.crear({
        usuarioId: 'otro',
        nombre: 'Ya',
        apellido: 'Existía',
        documento: Documento.crear('DNI', '30000001'),
        legajo: 'X-999',
      }),
    );

    await semilla('Gimnasio123').ejecutar();

    expect(
      profesores.profesores.filter((p) => p.documento.igualA(Documento.crear('DNI', '30000001'))),
    ).toHaveLength(1);
  });

  it('si ya existe un usuario con el email alumno01@cwgym.test, no crea otro con ese email', async () => {
    await usuarios.guardar(
      Usuario.crear({
        email: 'alumno01@cwgym.test',
        hashContrasenia: 'H1',
        rol: Rol.desde('Alumno'),
      }),
    );

    await semilla('Gimnasio123').ejecutar();

    expect(usuarios.usuarios.filter((u) => u.email === 'alumno01@cwgym.test')).toHaveLength(1);
  });

  it('sin SEMILLA_CONTRASENIA falla con "Falta la variable de entorno SEMILLA_CONTRASENIA"', async () => {
    await expect(semilla(undefined).ejecutar()).rejects.toThrow(
      'Falta la variable de entorno SEMILLA_CONTRASENIA',
    );
  });
});
