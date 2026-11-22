import type { Plan } from './plan.entidad.js';

/** RN-PLAN-22: filtros del listado. `hoy` es la fecha `AAAA-MM-DD` del reloj (RN-PLAN-15). */
export interface FiltrosPlanes {
  hoy: string;
  estado?: 'proximo' | 'vigente' | 'finalizado';
  alumnoId?: string;
  inicioDesde?: string;
  inicioHasta?: string;
}

/** Puerto de los planes. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioPlanes {
  abstract guardar(plan: Plan, fechaActual?: string): Promise<void>;
  abstract buscarPorId(id: string): Promise<Plan | null>;
  abstract agregarAlumno(planId: string, alumnoId: string, fechaActual: string): Promise<void>;
  abstract quitarAlumno(planId: string, alumnoId: string): Promise<void>;
  /** Los planes del alumno que están vigentes en esa fecha `AAAA-MM-DD` (RN-PLAN-14, 15). */
  abstract listarVigentesPorAlumno(alumnoId: string, fecha: string): Promise<Plan[]>;
  /** RN-PLAN-22: planes del profesor, filtrados, por inicio desc (desempate id asc), paginados. */
  abstract listarPorProfesor(
    profesorUsuarioId: string,
    filtros: FiltrosPlanes,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Plan[]; total: number }>;
}
