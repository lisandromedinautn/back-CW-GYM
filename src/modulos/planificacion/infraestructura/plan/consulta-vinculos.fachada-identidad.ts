import { Inject, Injectable } from '@nestjs/common';
import { FachadaIdentidad } from '../../../identidad/fachada-identidad.js';
import { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';

/** Adaptador del puerto `ConsultaVinculos` sobre la Fachada de identidad (CLAUDE.md, regla 4). */
@Injectable()
export class ConsultaVinculosFachadaIdentidad extends ConsultaVinculos {
  constructor(@Inject(FachadaIdentidad) private readonly identidad: FachadaIdentidad) {
    super();
  }

  alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean> {
    return this.identidad.alumnoVinculadoAProfesor(alumnoId, profesorUsuarioId);
  }

  async obtenerAlumnoIdPorUsuarioId(usuarioId: string): Promise<string | null> {
    const alumno = await this.identidad.obtenerAlumnoPorUsuarioId(usuarioId);
    return alumno?.id ?? null;
  }
}
