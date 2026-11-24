import type { Entrenamiento } from './entrenamiento.entidad.js';
import type { ResumenEntrenamiento } from './resumen-entrenamiento.js';

/** Serializa el cierre con el registro de series del entrenamiento. */
export abstract class RepositorioCierreEntrenamiento {
  abstract finalizarAtomico(
    id: string,
    instante: Date,
    calcular: (entrenamiento: Entrenamiento) => Promise<ResumenEntrenamiento>,
  ): Promise<Entrenamiento | null>;
}
