import type { Plan } from './plan.entidad.js';

/** Puerto de los planes. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioPlanes {
  abstract guardar(plan: Plan): Promise<void>;
  /** Los planes del alumno que están vigentes en esa fecha `AAAA-MM-DD` (RN-PLAN-14, 15). */
  abstract listarVigentesPorAlumno(alumnoId: string, fecha: string): Promise<Plan[]>;
}
