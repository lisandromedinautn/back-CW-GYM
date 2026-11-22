import { randomUUID } from 'node:crypto';
import { RecordBatido } from './record-batido.evento.js';
import type { TipoRecord } from './tipo-record.js';

/** Estado persistible de un Récord Personal (RN-ENT-13). */
export interface DatosRecordPersonal {
  id: string;
  alumnoId: string;
  ejercicioId: string;
  tipo: TipoRecord;
  valor: number;
  entrenamientoId: string;
  fecha: string;
}

export type DatosRecordNuevo = Omit<DatosRecordPersonal, 'id'>;

export interface ContextoRecord {
  entrenamientoId: string;
  fecha: string;
}

export interface RecordSuperado {
  record: RecordPersonal;
  evento: RecordBatido;
}

/** Récord Personal (RN-ENT-13): la mejor marca de un alumno en un ejercicio y tipo. */
export class RecordPersonal {
  private constructor(private readonly registro: DatosRecordPersonal) {}

  static crear(datos: DatosRecordNuevo): RecordPersonal {
    return new RecordPersonal({ ...datos, id: randomUUID() });
  }

  static reconstruir(datos: DatosRecordPersonal): RecordPersonal {
    return new RecordPersonal(datos);
  }

  get datos(): DatosRecordPersonal {
    return structuredClone(this.registro);
  }

  esSuperadoPor(valor: number): boolean {
    return valor > this.registro.valor;
  }

  /** Solo un valor estrictamente mayor reemplaza el récord y emite el evento. */
  superarCon(valor: number, contexto: ContextoRecord): RecordSuperado | null {
    if (!this.esSuperadoPor(valor)) return null;

    const record = new RecordPersonal({
      ...this.registro,
      valor,
      entrenamientoId: contexto.entrenamientoId,
      fecha: contexto.fecha,
    });
    return {
      record,
      evento: new RecordBatido(
        this.registro.alumnoId,
        this.registro.ejercicioId,
        this.registro.tipo,
        this.registro.valor,
        valor,
        contexto.entrenamientoId,
      ),
    };
  }
}
