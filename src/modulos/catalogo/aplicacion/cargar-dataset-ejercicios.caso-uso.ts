import type { Semilla } from '../../../compartido/aplicacion/semilla.js';
import { FuenteDatasetEjercicios } from '../dominio/fuente-dataset-ejercicios.puerto.js';
import { mapearRegistroDataset } from '../dominio/mapear-registro-dataset.js';
import { RepositorioEjercicios } from '../dominio/repositorio-ejercicios.puerto.js';

/**
 * Semilla de `yarn seed` (T01). Idempotente:
 * RN-CAT-09: un ejercicio cuyo id de dataset ya existe no se duplica ni se modifica.
 * RN-CAT-07: si el dataset repite un nombre, queda el primero que aparece en el archivo.
 */
export class CargarDatasetEjercicios implements Semilla {
  readonly nombre = 'Carga del dataset de ejercicios';

  constructor(
    private readonly fuente: FuenteDatasetEjercicios,
    private readonly repositorio: RepositorioEjercicios,
  ) {}

  async ejecutar(): Promise<void> {
    for (const registro of await this.fuente.leer()) {
      if (await this.repositorio.existePorIdDataset(registro.id)) continue;
      if (await this.repositorio.existePorNombre(registro.name)) continue;
      await this.repositorio.guardar(mapearRegistroDataset(registro));
    }
  }
}
