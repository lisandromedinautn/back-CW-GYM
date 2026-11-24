import type { RecordPersonal } from './record-personal.entidad.js';

/** Persistencia de los récords personales (RN-ENT-13). */
export abstract class RepositorioRecords {
  abstract buscarPorAlumnoYEjercicios(
    alumnoId: string,
    ejercicioIds: string[],
  ): Promise<RecordPersonal[]>;
  abstract guardar(records: RecordPersonal[]): Promise<void>;
}
