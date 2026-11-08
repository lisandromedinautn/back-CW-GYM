export const GENERADOR_CODIGOS = Symbol('GeneradorCodigos');

/** Puerto técnico: arma un Código de Profesor nuevo (RN-IDE-08). Es aleatorio, por eso es un borde. */
export interface GeneradorCodigos {
  generar(): string;
}
