/**
 * Lo que planificación necesita saber de un ejercicio del catálogo para prescribirlo.
 * Lo arma la infraestructura con la Fachada de catálogo (CLAUDE.md, regla 4): el dominio
 * de planificación no conoce las clases de catálogo.
 */
export interface EjercicioDelCatalogo {
  id: string;
  /** RN-PLAN-04: true si el ejercicio es "por tiempo"; false si es "por repeticiones". */
  porTiempo: boolean;
  /** RN-PLAN-05: true si el tipo de carga incluye Peso Extra. */
  admitePesoExtra: boolean;
}
