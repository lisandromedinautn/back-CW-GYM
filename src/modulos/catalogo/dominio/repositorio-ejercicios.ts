import type { Ejercicio } from './ejercicio.js';

/** Puerto del catálogo. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioEjercicios {
  abstract guardar(ejercicio: Ejercicio): Promise<void>;
  abstract existePorIdDataset(idDataset: string): Promise<boolean>;
  abstract existePorNombre(nombre: string): Promise<boolean>;
  /** Todos los ejercicios del catálogo, sin orden garantizado. */
  abstract listar(): Promise<Ejercicio[]>;
}
