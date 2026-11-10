import type { Alumno } from './alumno.entidad.js';
import type { Documento } from '../documento/documento.valor.js';

export const REPOSITORIO_ALUMNOS = Symbol('RepositorioAlumnos');

export interface RepositorioAlumnos {
  existePorDocumento(documento: Documento): Promise<boolean>;
  buscarPorUsuarioId(usuarioId: string): Promise<Alumno | null>;
  guardar(alumno: Alumno): Promise<void>;
}
