import type { Alumno } from './alumno.entidad.js';
import type { Documento } from './documento.valor.js';

export const REPOSITORIO_ALUMNOS = Symbol('RepositorioAlumnos');

export interface RepositorioAlumnos {
  existePorDocumento(documento: Documento): Promise<boolean>;
  guardar(alumno: Alumno): Promise<void>;
}
