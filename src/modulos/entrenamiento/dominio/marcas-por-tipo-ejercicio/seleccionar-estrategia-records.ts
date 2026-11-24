import type { EstrategiaRecords } from './estrategia-records.js';
import type { EjercicioParaRecords } from './ejercicio-para-records.js';
import { RecordsPorRepeticionesConCarga } from './records-por-repeticiones-con-carga.estrategia.js';
import { RecordsPorRepeticionesSinPeso } from './records-por-repeticiones-sin-peso.estrategia.js';
import { RecordsPorTiempo } from './records-por-tiempo.estrategia.js';

/** Selecciona la estrategia de marcas según el ejercicio (RN-ENT-10). */
export function seleccionarEstrategiaRecords(ejercicio: EjercicioParaRecords): EstrategiaRecords {
  if (ejercicio.tipo === 'por tiempo') return new RecordsPorTiempo();
  if (ejercicio.tipoCarga === 'Sin Peso') {
    return new RecordsPorRepeticionesSinPeso();
  }
  return new RecordsPorRepeticionesConCarga();
}
