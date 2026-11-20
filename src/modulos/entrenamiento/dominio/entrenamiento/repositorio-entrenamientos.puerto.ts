import type { Entrenamiento } from './entrenamiento.entidad.js';

export abstract class RepositorioEntrenamientos {
  /** Devuelve false si el alumno ya inició un entrenamiento esa fecha. */
  abstract insertar(entrenamiento: Entrenamiento): Promise<boolean>;
  abstract buscarUltimo(alumnoId: string, hastaFecha: string): Promise<Entrenamiento | null>;
}
