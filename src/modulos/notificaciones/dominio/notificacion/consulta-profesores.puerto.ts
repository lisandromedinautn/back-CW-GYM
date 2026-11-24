/**
 * Puerto hacia Identidad (Fachada de identidad). Lo implementa la infraestructura del módulo.
 * Clase abstracta para que también sirva de token de inyección en Nest.
 */
export abstract class ConsultaProfesores {
  /** El profesor vinculado al alumno y el nombre del alumno, o null si el alumno no tiene profesor. */
  abstract profesorDelAlumno(alumnoId: string): Promise<{
    profesorId: string;
    alumno: { id: string; nombre: string; apellido: string };
  } | null>;
  /** El id del profesor asociado al usuario del JWT, o null si el usuario no es profesor. */
  abstract profesorDeUsuario(usuarioId: string): Promise<string | null>;
}
