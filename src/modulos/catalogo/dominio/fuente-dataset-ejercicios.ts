import type { RegistroDataset } from './registro-dataset.js';

/** Puerto técnico: de dónde salen los registros del dataset (en el MVP, un archivo JSON). */
export abstract class FuenteDatasetEjercicios {
  /** Devuelve los registros en el orden en que aparecen en el origen. */
  abstract leer(): Promise<RegistroDataset[]>;
}
