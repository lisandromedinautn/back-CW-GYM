import type { MarcaRecord } from '../record-personal/marca-record.js';
import type { EstrategiaRecords } from './estrategia-records.js';
import type { SerieParaRecords } from './serie-para-records.js';

/** RN-ENT-10: repeticiones sin peso solo generan récord de repeticiones. */
export class RecordsPorRepeticionesSinPeso implements EstrategiaRecords {
  marcasDe({ serie }: SerieParaRecords): MarcaRecord[] {
    const repeticiones = serie.realizada.repeticiones;
    if (repeticiones === null) return [];
    return [{ ejercicioId: serie.ejercicioId, tipo: 'repeticiones', valor: repeticiones }];
  }
}
