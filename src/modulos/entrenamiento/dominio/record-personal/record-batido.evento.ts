import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { TipoRecord } from './tipo-record.js';

/** RN-ENT-13: se emite cuando una marca supera estrictamente el récord anterior. */
export class RecordBatido implements EventoDominio {
  readonly nombre = 'RecordBatido';

  constructor(
    readonly alumnoId: string,
    readonly ejercicioId: string,
    readonly tipo: TipoRecord,
    readonly valorAnterior: number,
    readonly valorNuevo: number,
    readonly entrenamientoId: string,
  ) {}
}
