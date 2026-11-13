import type { Alumno } from './alumno.entidad.js';
import type { Documento } from '../documento/documento.valor.js';

export const REPOSITORIO_ALUMNOS = Symbol('RepositorioAlumnos');

export interface RepositorioAlumnos {
  existePorDocumento(documento: Documento): Promise<boolean>;
  buscarPorId(id: string): Promise<Alumno | null>;
  buscarPorUsuarioId(usuarioId: string): Promise<Alumno | null>;
  /** Los alumnos vinculados al profesor (RN-IDE-09), ordenados por apellido y nombre. */
  listarPorProfesor(profesorId: string): Promise<Alumno[]>;
  guardar(alumno: Alumno): Promise<void>;
}
