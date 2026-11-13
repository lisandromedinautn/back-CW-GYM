import { Inject, Injectable } from '@nestjs/common';
import {
  REPOSITORIO_ALUMNOS,
  type RepositorioAlumnos,
} from './dominio/alumno/repositorio-alumnos.puerto.js';
import {
  REPOSITORIO_PROFESORES,
  type RepositorioProfesores,
} from './dominio/profesor/repositorio-profesores.puerto.js';

/** Datos públicos de un alumno para otros módulos: solo tipos primitivos. */
export interface AlumnoPublico {
  id: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  /** Profesor vinculado (RN-IDE-09), o null si todavía no se vinculó. */
  profesorId: string | null;
}

/**
 * Fachada de identidad: la única puerta de entrada de otros módulos (CLAUDE.md, regla 4).
 * Vive en la raíz del módulo, fuera de las capas, para que la regla de lint de importaciones
 * entre módulos la permita.
 */
@Injectable()
export class FachadaIdentidad {
  constructor(
    @Inject(REPOSITORIO_ALUMNOS) private readonly alumnos: RepositorioAlumnos,
    @Inject(REPOSITORIO_PROFESORES) private readonly profesores: RepositorioProfesores,
  ) {}

  async obtenerAlumnoPorId(id: string): Promise<AlumnoPublico | null> {
    const alumno = await this.alumnos.buscarPorId(id);
    return alumno ? aAlumnoPublico(alumno) : null;
  }

  async obtenerAlumnoPorUsuarioId(usuarioId: string): Promise<AlumnoPublico | null> {
    const alumno = await this.alumnos.buscarPorUsuarioId(usuarioId);
    return alumno ? aAlumnoPublico(alumno) : null;
  }

  /** RN-PLAN-13: el alumno está vinculado al profesor que recibe el usuario del JWT. */
  async alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean> {
    const [alumno, profesor] = await Promise.all([
      this.alumnos.buscarPorId(alumnoId),
      this.profesores.buscarPorUsuarioId(profesorUsuarioId),
    ]);
    return alumno !== null && profesor !== null && alumno.profesorId === profesor.id;
  }
}

const aAlumnoPublico = (alumno: {
  id: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  profesorId: string | null;
}): AlumnoPublico => ({
  id: alumno.id,
  usuarioId: alumno.usuarioId,
  nombre: alumno.nombre,
  apellido: alumno.apellido,
  profesorId: alumno.profesorId,
});
