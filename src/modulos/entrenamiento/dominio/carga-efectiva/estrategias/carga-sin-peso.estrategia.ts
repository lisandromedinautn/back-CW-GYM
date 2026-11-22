import type { DatosCarga, EstrategiaCargaEfectiva } from '../estrategia-carga-efectiva.js';

/** RN-ENT-07: Sin Peso no suma carga. */
export class CargaSinPeso implements EstrategiaCargaEfectiva {
  calcular(_datos: DatosCarga): number {
    return 0;
  }
}
