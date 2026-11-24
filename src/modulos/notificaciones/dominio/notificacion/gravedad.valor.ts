import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

/**
 * Gravedad de una notificación (RN-NOT-02). Grave si las series por debajo son el 40% o más
 * del total. Se compara en enteros (5 × porDebajo ≥ 2 × total) para que el 40% exacto no
 * dependa del redondeo.
 */
export class Gravedad {
  private constructor(readonly valor: 'leve' | 'grave') {}

  static desde(porDebajo: number, total: number): Gravedad {
    if (total === 0 || porDebajo === 0 || porDebajo > total) {
      throw new ErrorDominio(
        'RN-NOT-02',
        'La cantidad de series por debajo tiene que estar entre 1 y el total de series',
        'validacion',
      );
    }
    return new Gravedad(5 * porDebajo >= 2 * total ? 'grave' : 'leve');
  }

  toString(): string {
    return this.valor;
  }
}
