import type { CargaEfectiva } from '../carga-efectiva/carga-efectiva.valor.js';

/** Volumen de una serie (RN-ENT-06): carga efectiva × repeticiones. */
export class VolumenSerie {
  private constructor(readonly kg: number) {}

  static calcular(cargaEfectiva: CargaEfectiva, repeticiones: number): VolumenSerie {
    return new VolumenSerie(cargaEfectiva.kg * repeticiones);
  }
}
