/**
 * Puerto de consulta a Entrenamiento (RN-PLAN-23). Planificación no conoce ese módulo: el
 * adaptador lo resuelve en infraestructura. Clase abstracta para que sirva de token en Nest.
 */
export abstract class ConsultaEntrenamientosIniciados {
  /** `true` si alguno de los alumnos tiene un Entrenamiento iniciado en la fecha `AAAA-MM-DD`. */
  abstract hayIniciadoEn(alumnoIds: string[], fecha: string): Promise<boolean>;
}
