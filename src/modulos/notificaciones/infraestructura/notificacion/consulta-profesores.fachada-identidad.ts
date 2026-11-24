import { Inject, Injectable } from '@nestjs/common';
import { FachadaIdentidad } from '../../../identidad/fachada-identidad.js';
import { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';

/** Adaptador del puerto `ConsultaProfesores` sobre la Fachada de identidad (CLAUDE.md, regla 4). */
@Injectable()
export class ConsultaProfesoresFachadaIdentidad extends ConsultaProfesores {
  constructor(@Inject(FachadaIdentidad) private readonly identidad: FachadaIdentidad) {
    super();
  }

  async profesorDelAlumno(alumnoId: string): Promise<{
    profesorId: string;
    alumno: { id: string; nombre: string; apellido: string };
  } | null> {
    const alumno = await this.identidad.obtenerAlumnoPorId(alumnoId);
    if (alumno === null || alumno.profesorId === null) return null;
    return {
      profesorId: alumno.profesorId,
      alumno: { id: alumno.id, nombre: alumno.nombre, apellido: alumno.apellido },
    };
  }

  async profesorDeUsuario(usuarioId: string): Promise<string | null> {
    const profesor = await this.identidad.obtenerProfesorPorUsuarioId(usuarioId);
    return profesor?.id ?? null;
  }
}
