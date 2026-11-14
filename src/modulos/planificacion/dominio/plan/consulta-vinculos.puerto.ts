/**
 * Puerto hacia Identidad y Vínculos (RN-PLAN-13, US08). Lo implementa la infraestructura con la
 * Fachada de identidad. Clase abstracta para que también sirva de token de inyección en Nest.
 */
export abstract class ConsultaVinculos {
  /** RN-PLAN-13: el alumno está vinculado al profesor del plan. */
  abstract alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean>;
  /** US08: el id del alumno asociado al usuario del JWT, o null si no tiene ficha de alumno. */
  abstract obtenerAlumnoIdPorUsuarioId(usuarioId: string): Promise<string | null>;
}
