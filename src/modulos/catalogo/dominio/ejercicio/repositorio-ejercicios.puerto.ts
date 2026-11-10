import type { Ejercicio } from './ejercicio.entidad.js';

/** Puerto del catálogo. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioEjercicios {
  abstract guardar(ejercicio: Ejercicio): Promise<void>;
  abstract existePorIdDataset(idDataset: string): Promise<boolean>;
  abstract existePorNombre(nombre: string): Promise<boolean>;
  /** Todos los ejercicios del catálogo, sin orden garantizado. */
  abstract listar(): Promise<Ejercicio[]>;

  /**
   * El ejercicio con ese id, o null si no existe. La implementación por defecto recorre
   * `listar()`; el repositorio TypeORM la reemplaza por una consulta directa.
   */
  async buscarPorId(id: string): Promise<Ejercicio | null> {
    return (await this.listar()).find((ejercicio) => ejercicio.id === id) ?? null;
  }
}
