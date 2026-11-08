import type { NombreRol } from './rol.valor.js';

export const EMISOR_TOKENS = Symbol('EmisorTokens');

/** Contenido del JWT (RN-IDE-01): el id del usuario y su rol. */
export interface DatosToken {
  sub: string;
  rol: NombreRol;
}

export interface EmisorTokens {
  emitir(datos: DatosToken): Promise<string>;
}
