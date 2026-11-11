import type { Rutina } from './rutina.entidad.js';

/** Puerto de las rutinas. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioRutinas {
  abstract guardar(rutina: Rutina): Promise<void>;
  abstract buscarPorId(id: string): Promise<Rutina | null>;
  /** Las rutinas del profesor, de la más nueva a la más vieja. `pagina` arranca en 1. */
  abstract listarPorProfesor(
    profesorUsuarioId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Rutina[]; total: number }>;
  /** Id y nombre de todas las rutinas del profesor (RN-PLAN-21: unicidad y nombre por defecto). */
  abstract listarNombresPorProfesor(
    profesorUsuarioId: string,
  ): Promise<{ id: string; nombre: string }[]>;
  /** Todas las rutinas de todos los profesores, de la más vieja a la más nueva (RN-PLAN-21). */
  abstract listarTodasPorAntiguedad(): Promise<Rutina[]>;
}
