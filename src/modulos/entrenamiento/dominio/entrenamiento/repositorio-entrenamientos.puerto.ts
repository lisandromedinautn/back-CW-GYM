import type { Entrenamiento } from './entrenamiento.entidad.js';
import type { SerieRealizada } from './serie-realizada.valor.js';

export abstract class RepositorioEntrenamientos {
  /** Devuelve false si el alumno ya inició un entrenamiento esa fecha. */
  abstract insertar(entrenamiento: Entrenamiento): Promise<boolean>;
  /** El entrenamiento con sus series realizadas, o null si no existe. */
  abstract buscarPorId(id: string): Promise<Entrenamiento | null>;
  abstract buscarUltimo(alumnoId: string, hastaFecha: string): Promise<Entrenamiento | null>;
  /**
   * Guarda una serie realizada. Si ya hay una con el mismo orden, número y posición en ese
   * entrenamiento, la reemplaza (corrección, decisión de US14). Debe ser atómico.
   */
  /** Los entrenamientos del alumno, del más nuevo al más viejo por fecha (US18). */
  abstract listarPorAlumno(
    alumnoId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Entrenamiento[]; total: number }>;
  abstract guardarSerie(entrenamientoId: string, serie: SerieRealizada): Promise<void>;
}
