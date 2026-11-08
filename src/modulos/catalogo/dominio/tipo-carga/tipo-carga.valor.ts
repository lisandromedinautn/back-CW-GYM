import { ErrorDominio } from '../../../../compartido/dominio/error-dominio.js';

/** RN-CAT-03: el tipo de carga es uno de los cuatro del glosario y no admite otro valor. */
export class TipoCarga {
  static readonly SIN_PESO = new TipoCarga('Sin Peso', false);
  static readonly PESO_CORPORAL = new TipoCarga('Peso Corporal', true);
  static readonly PESO_EXTRA = new TipoCarga('Peso Extra', false);
  static readonly PESO_CORPORAL_Y_EXTRA = new TipoCarga('Peso Corporal + Peso Extra', true);

  private constructor(
    readonly valor: string,
    /** RN-CAT-06: solo estos tipos de carga usan el factor de peso corporal. */
    readonly incluyePesoCorporal: boolean,
  ) {}

  static desde(texto: string): TipoCarga {
    const tipo = [
      TipoCarga.SIN_PESO,
      TipoCarga.PESO_CORPORAL,
      TipoCarga.PESO_EXTRA,
      TipoCarga.PESO_CORPORAL_Y_EXTRA,
    ].find((candidato) => candidato.valor === texto);
    if (!tipo) {
      throw new ErrorDominio(
        'RN-CAT-03',
        `El tipo de carga "${texto}" no es válido: tiene que ser Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra`,
      );
    }
    return tipo;
  }
}
