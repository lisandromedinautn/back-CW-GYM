/**
 * Categoría del error. El dominio no conoce HTTP: el filtro de `presentacion` traduce
 * cada categoría a su código de estado (validacion → 400, credenciales → 401,
 * prohibido → 403, no-encontrado → 404, conflicto → 409).
 */
export type CategoriaError =
  'validacion' | 'credenciales' | 'prohibido' | 'no-encontrado' | 'conflicto';

/**
 * Error que lanza el dominio cuando se viola una regla de negocio.
 * Contrato con el front (src/compartido/CLAUDE.md): `{ codigo: 'RN-XXX-nn', mensaje }`.
 */
export class ErrorDominio extends Error {
  constructor(
    readonly codigo: string,
    mensaje: string,
    readonly categoria: CategoriaError = 'validacion',
  ) {
    super(mensaje);
    this.name = 'ErrorDominio';
  }
}
