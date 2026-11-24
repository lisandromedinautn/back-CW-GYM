import type { MarcaRecord } from '../record-personal/marca-record.js';
import type { SerieParaRecords } from './serie-para-records.js';

/** Estrategia de marcas según el tipo de ejercicio y el tipo de carga (OCP). */
export interface EstrategiaRecords {
  marcasDe(entrada: SerieParaRecords): MarcaRecord[];
}
