import { RecordPersonal } from '../../dominio/record-personal/record-personal.entidad.js';
import type { TipoRecord } from '../../dominio/record-personal/tipo-record.js';
import type { RecordPersonalEsquema } from './record-personal.esquema.js';

export function recordAFila(record: RecordPersonal): RecordPersonalEsquema {
  return { ...record.datos };
}

export function filaARecord(fila: RecordPersonalEsquema): RecordPersonal {
  return RecordPersonal.reconstruir({
    id: fila.id,
    alumnoId: fila.alumnoId,
    ejercicioId: fila.ejercicioId,
    tipo: fila.tipo as TipoRecord,
    valor: fila.valor,
    entrenamientoId: fila.entrenamientoId,
    fecha: fila.fecha,
  });
}
