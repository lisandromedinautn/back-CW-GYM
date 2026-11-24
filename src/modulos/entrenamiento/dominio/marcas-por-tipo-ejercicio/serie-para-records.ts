import type { SerieRealizada } from '../entrenamiento/serie-realizada.valor.js';
import type { EjercicioParaRecords } from './ejercicio-para-records.js';

/** Serie realizada junto con el ejercicio y el peso corporal del alumno. */
export interface SerieParaRecords {
  serie: SerieRealizada;
  ejercicio: EjercicioParaRecords;
  pesoCorporalKg: number;
}
