import type { ResumenEntrenamiento } from '../../dominio/entrenamiento/resumen-entrenamiento.js';
import type { TipoRecord } from '../../dominio/record-personal/tipo-record.js';

export interface RecordBatidoResumen {
  ejercicioId: string;
  nombre: string;
  tipo: TipoRecord;
  valorAnterior: number;
  valorNuevo: number;
}

export interface ResumenEntrenamientoConRecords extends ResumenEntrenamiento {
  recordsBatidos?: RecordBatidoResumen[];
}
