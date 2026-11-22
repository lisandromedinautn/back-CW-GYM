import type { MarcaRecord } from '../record-personal/marca-record.js';
import type { EstrategiaRecords } from './estrategia-records.js';
import type { SerieParaRecords } from './serie-para-records.js';

/** RN-ENT-10: ejercicios por tiempo generan récord de tiempo. */
export class RecordsPorTiempo implements EstrategiaRecords {
  marcasDe({ serie }: SerieParaRecords): MarcaRecord[] {
    const segundos = serie.realizada.segundos;
    if (segundos === null) return [];
    return [{ ejercicioId: serie.ejercicioId, tipo: 'tiempo', valor: segundos }];
  }
}
