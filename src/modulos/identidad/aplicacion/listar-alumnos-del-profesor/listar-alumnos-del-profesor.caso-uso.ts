import type { RepositorioAlumnos } from '../../dominio/alumno/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../../dominio/profesor/repositorio-profesores.puerto.js';

/** Alumno que el profesor puede asignar a un plan (US07, RN-PLAN-13). */
export interface AlumnoDelProfesor {
  id: string;
  nombre: string;
  apellido: string;
}

/**
 * US07: lista los alumnos vinculados al profesor que consulta. La pantalla de crear plan los
 * ofrece para asignar; no incluye a los alumnos de otros profesores (RN-PLAN-13).
 */
export class ListarAlumnosDelProfesor {
  constructor(
    private readonly alumnos: RepositorioAlumnos,
    private readonly profesores: RepositorioProfesores,
  ) {}

  async ejecutar(profesorUsuarioId: string): Promise<AlumnoDelProfesor[]> {
    const profesor = await this.profesores.buscarPorUsuarioId(profesorUsuarioId);
    if (!profesor) return [];
    const alumnos = await this.alumnos.listarPorProfesor(profesor.id);
    return alumnos.map(({ id, nombre, apellido }) => ({ id, nombre, apellido }));
  }
}
