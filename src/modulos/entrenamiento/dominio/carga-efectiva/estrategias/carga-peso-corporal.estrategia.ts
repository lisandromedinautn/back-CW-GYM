import type { DatosCarga, EstrategiaCargaEfectiva } from '../estrategia-carga-efectiva.js';

/** RN-ENT-07: Peso Corporal usa peso corporal × factor (porcentaje). */
export class CargaPesoCorporal implements EstrategiaCargaEfectiva {
  calcular(datos: DatosCarga): number {
    return datos.pesoCorporalKg * (datos.factorPesoCorporal / 100);
  }
}
