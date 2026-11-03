/**
 * Puerto de una semilla: un caso de uso que carga datos iniciales con `yarn seed`.
 *
 * Toda semilla tiene que ser idempotente: correrla dos veces deja la base igual que una vez
 * (por ejemplo, RN-IDE-14: si el Admin ya existe, no se duplica ni se modifica).
 * Se implementa como un caso de uso más (`sembrar-<algo>.caso-uso.ts`) en la capa
 * `aplicacion` de su módulo, se registra como provider y se agrega a la lista de `src/semillas.ts`.
 */
export interface Semilla {
  /** Nombre que se muestra en el log al ejecutarla. */
  readonly nombre: string;
  ejecutar(): Promise<void>;
}
