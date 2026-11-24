import type { EntrenamientoDelAlumno } from './racha-incumplimiento.js';

/** Registro propio de Notificaciones con los Entrenamientos finalizados de cada alumno (RN-NOT-08). */
export abstract class RepositorioFinalizaciones {
  /** Idempotente: registrar dos veces el mismo Entrenamiento no lo duplica. */
  abstract registrar(alumnoId: string, entrenamiento: EntrenamientoDelAlumno): Promise<void>;
  abstract deAlumno(alumnoId: string): Promise<EntrenamientoDelAlumno[]>;
}
