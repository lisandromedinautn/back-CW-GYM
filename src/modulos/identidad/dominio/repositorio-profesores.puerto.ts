import type { Documento } from './documento.valor.js';
import type { Profesor } from './profesor.entidad.js';

export const REPOSITORIO_PROFESORES = Symbol('RepositorioProfesores');

export interface RepositorioProfesores {
  existePorLegajo(legajo: string): Promise<boolean>;
  existePorDocumento(documento: Documento): Promise<boolean>;
  buscarPorUsuarioId(usuarioId: string): Promise<Profesor | null>;
  /** Solo encuentra códigos vigentes: el reemplazado ya no está guardado (RN-IDE-08, 11). */
  buscarPorCodigo(codigo: string): Promise<Profesor | null>;
  guardar(profesor: Profesor): Promise<void>;
}
