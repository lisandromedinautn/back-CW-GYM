import type { Rutina } from './rutina.entidad.js';

/** Puerto de las rutinas. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioRutinas {
  abstract guardar(rutina: Rutina): Promise<void>;
  abstract buscarPorId(id: string): Promise<Rutina | null>;
}
