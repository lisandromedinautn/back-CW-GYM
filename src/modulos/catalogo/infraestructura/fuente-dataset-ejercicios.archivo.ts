import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FuenteDatasetEjercicios } from '../dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import type { RegistroDataset } from '../dominio/dataset/registro-dataset.js';

export const RUTA_DATASET_EJERCICIOS = 'datos/ejercicios-dataset.json';

/** Lee los registros de un archivo JSON. La ruta es relativa a `process.cwd()`. */
export class FuenteDatasetEjerciciosArchivo extends FuenteDatasetEjercicios {
  constructor(private readonly ruta: string = RUTA_DATASET_EJERCICIOS) {
    super();
  }

  async leer(): Promise<RegistroDataset[]> {
    const contenido = await readFile(resolve(process.cwd(), this.ruta), 'utf8');
    return JSON.parse(contenido) as RegistroDataset[];
  }
}
