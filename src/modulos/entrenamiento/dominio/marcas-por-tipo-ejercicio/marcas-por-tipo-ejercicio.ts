import type { MarcaRecord } from '../record-personal/marca-record.js';
import { seleccionarEstrategiaRecords } from './seleccionar-estrategia-records.js';
import type { SerieParaRecords } from './serie-para-records.js';

/** Punto de entrada del cálculo de marcas de una serie (RN-ENT-10). */
export class MarcasPorTipoEjercicio {
  marcasDe(entrada: SerieParaRecords): MarcaRecord[] {
    return seleccionarEstrategiaRecords(entrada.ejercicio).marcasDe(entrada);
  }
}
