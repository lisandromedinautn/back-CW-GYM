import type { DatosCarga, EstrategiaCargaEfectiva } from '../estrategia-carga-efectiva.js';

/** RN-ENT-12: Peso Corporal + Peso Extra suma ambos componentes. */
export class CargaPesoCorporalYExtra implements EstrategiaCargaEfectiva {
  calcular(datos: DatosCarga): number {
    return datos.pesoCorporalKg * (datos.factorPesoCorporal / 100) + datos.pesoExtraKg;
  }
}
