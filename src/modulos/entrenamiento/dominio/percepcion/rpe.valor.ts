import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

/** RN-ENT-14: el RPE es un entero de 1 a 10. */
export class Rpe {
  private constructor(readonly valor: number) {}

  static crear(valor: number): Rpe {
    if (!Number.isInteger(valor) || valor < 1 || valor > 10) {
      throw new ErrorDominio('RN-ENT-14', 'El RPE es un entero de 1 a 10', 'validacion');
    }
    return new Rpe(valor);
  }
}
