import { seleccionarEstrategiaCarga } from './estrategias/seleccionar-estrategia-carga.js';
import type { TipoCarga } from './tipo-carga.js';

/** Datos para calcular la carga efectiva de una serie (RN-ENT-07). */
export interface DatosCargaEfectiva {
  tipoCarga: TipoCarga;
  pesoCorporalKg: number;
  factorPesoCorporal: number;
  pesoExtraKg: number;
}

/** Carga Efectiva (RN-ENT-07): la carga real de una serie según el tipo de carga. */
export class CargaEfectiva {
  private constructor(readonly kg: number) {}

  static calcular(datos: DatosCargaEfectiva): CargaEfectiva {
    const estrategia = seleccionarEstrategiaCarga(datos.tipoCarga);
    return new CargaEfectiva(estrategia.calcular(datos));
  }
}
