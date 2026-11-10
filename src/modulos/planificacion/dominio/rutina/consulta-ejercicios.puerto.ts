import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';

/**
 * Puerto hacia el catálogo (RN-PLAN-04, 05, 06). Lo implementa la infraestructura con la
 * Fachada de catálogo. Clase abstracta para que también sirva de token de inyección en Nest.
 */
export abstract class ConsultaEjercicios {
  /** El ejercicio con ese id, o null si no existe en el catálogo. */
  abstract buscarPorId(id: string): Promise<EjercicioDelCatalogo | null>;
}
