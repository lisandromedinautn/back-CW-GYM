import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

/** RN-ENT-15: la sensación de fuerza es un entero de 1 a 5. */
export class SensacionFuerza {
  private constructor(readonly valor: number) {}

  static crear(valor: number): SensacionFuerza {
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      throw new ErrorDominio(
        'RN-ENT-15',
        'La sensación de fuerza es un entero de 1 a 5',
        'validacion',
      );
    }
    return new SensacionFuerza(valor);
  }
}
