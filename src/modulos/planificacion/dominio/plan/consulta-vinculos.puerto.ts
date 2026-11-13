/**
 * Puerto hacia Identidad y Vínculos (RN-PLAN-13). Lo implementa la infraestructura con la
 * Fachada de identidad. Clase abstracta para que también sirva de token de inyección en Nest.
 */
export abstract class ConsultaVinculos {
  abstract alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean>;
}
