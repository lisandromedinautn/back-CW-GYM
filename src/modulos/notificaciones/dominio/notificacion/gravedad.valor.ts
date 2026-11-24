import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

import type { Percepcion } from './percepcion.valor.js';

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

  static reconstruir(valor: 'leve' | 'grave'): Gravedad {
    return new Gravedad(valor);
  }

  /** RN-NOT-06: Leve con una condición mala, Grave con las dos, null si no es mala. */
  static dePercepcion(percepcion: Percepcion): Gravedad | null {
    if (!percepcion.esMala()) return null;
    return new Gravedad(percepcion.rpeAlto && percepcion.fuerzaBaja ? 'grave' : 'leve');
  }

  /** RN-NOT-07: la mayor de las dos; `b` puede ser null. */
  static mayor(a: Gravedad, b: Gravedad | null): Gravedad {
    return b !== null && b.valor === 'grave' ? b : a;
  }

  toString(): string {
    return this.valor;
  }
}
