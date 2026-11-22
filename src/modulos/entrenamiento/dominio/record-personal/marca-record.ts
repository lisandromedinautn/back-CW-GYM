import type { TipoRecord } from './tipo-record.js';

/** Marca candidata a récord que produce una serie (RN-ENT-10). */
export interface MarcaRecord {
  ejercicioId: string;
  tipo: TipoRecord;
  valor: number;
}
