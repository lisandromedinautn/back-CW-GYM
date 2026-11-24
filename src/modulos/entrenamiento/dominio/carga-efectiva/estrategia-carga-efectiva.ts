/** Datos de entrada comunes a todas las estrategias de carga efectiva (RN-ENT-07). */
export interface DatosCarga {
  pesoCorporalKg: number;
  factorPesoCorporal: number;
  pesoExtraKg: number;
}

/** Estrategia de cálculo de carga efectiva según el tipo de carga (OCP). */
export interface EstrategiaCargaEfectiva {
  calcular(datos: DatosCarga): number;
}
