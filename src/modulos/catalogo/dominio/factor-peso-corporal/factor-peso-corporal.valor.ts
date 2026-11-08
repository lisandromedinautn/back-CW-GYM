import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

/**
 * RN-CAT-04: porcentaje del peso corporal que se suma a la carga. Es mayor que 0 y hasta 100
 * (0% no es válido, 100% sí). Vale 100% si no se indica.
 */
export class FactorPesoCorporal {
  private constructor(readonly porcentaje: number) {}

  static crear(porcentaje: number = 100): FactorPesoCorporal {
    if (!(porcentaje > 0 && porcentaje <= 100)) {
      throw new ErrorDominio(
        'RN-CAT-04',
        `El factor de peso corporal ${porcentaje}% no es válido: tiene que ser mayor que 0% y hasta 100%`,
      );
    }
    return new FactorPesoCorporal(porcentaje);
  }
}
