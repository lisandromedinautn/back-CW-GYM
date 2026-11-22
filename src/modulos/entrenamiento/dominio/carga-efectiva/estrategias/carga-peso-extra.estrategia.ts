import type { DatosCarga, EstrategiaCargaEfectiva } from '../estrategia-carga-efectiva.js';

/** RN-ENT-07: Peso Extra usa solo el peso extra. */
export class CargaPesoExtra implements EstrategiaCargaEfectiva {
  calcular(datos: DatosCarga): number {
    return datos.pesoExtraKg;
  }
}
