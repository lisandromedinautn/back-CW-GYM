import { ErrorDominio } from '../../../../compartido/dominio/error-dominio.js';

/** RN-CAT-02: el tipo de ejercicio es "por tiempo" o "por repeticiones" y no admite otro valor. */
export class TipoEjercicio {
  static readonly POR_TIEMPO = new TipoEjercicio('por tiempo');
  static readonly POR_REPETICIONES = new TipoEjercicio('por repeticiones');

  private constructor(readonly valor: string) {}

  static desde(texto: string): TipoEjercicio {
    const tipo = [TipoEjercicio.POR_TIEMPO, TipoEjercicio.POR_REPETICIONES].find(
      (candidato) => candidato.valor === texto,
    );
    if (!tipo) {
      throw new ErrorDominio(
        'RN-CAT-02',
        `El tipo de ejercicio "${texto}" no es válido: tiene que ser "por tiempo" o "por repeticiones"`,
      );
    }
    return tipo;
  }
}
