/** Nombre público de un ejercicio del catálogo (US08: el alumno ve el nombre, no solo el id). */
export interface NombreDeEjercicio {
  id: string;
  nombre: string;
}

/**
 * Puerto hacia el catálogo para resolver los nombres de los ejercicios prescriptos. El catálogo
 * es solo para Admin y Profesor, así que el back resuelve los nombres al armar la rutina del día
 * (US08). Lo implementa la infraestructura con la Fachada de catálogo.
 */
export abstract class ConsultaNombresEjercicios {
  /** Los nombres de los ejercicios que existan en el catálogo; los ids desconocidos se omiten. */
  abstract buscarPorIds(ids: readonly string[]): Promise<NombreDeEjercicio[]>;
}
