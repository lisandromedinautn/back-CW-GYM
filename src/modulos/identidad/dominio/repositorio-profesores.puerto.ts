import type { Documento } from './documento.valor.js';
import type { Profesor } from './profesor.entidad.js';

export const REPOSITORIO_PROFESORES = Symbol('RepositorioProfesores');

export interface RepositorioProfesores {
  existePorLegajo(legajo: string): Promise<boolean>;
  existePorDocumento(documento: Documento): Promise<boolean>;
  guardar(profesor: Profesor): Promise<void>;
}
