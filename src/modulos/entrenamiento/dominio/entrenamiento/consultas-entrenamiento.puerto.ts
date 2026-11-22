import type { CopiaRutina } from './copia-rutina.valor.js';

export interface ConsultaAlumno {
  obtenerAlumnoConPeso(usuarioId: string): Promise<{ id: string; pesoKg: number } | null>;
}

export interface ConsultaRutinaDelDia {
  consultarRutinaDelDia(
    alumnoId: string,
    fecha: string,
  ): Promise<{ estado: 'rutina'; rutina: CopiaRutina } | { estado: 'descanso' | 'sin-plan' }>;
}

/** RN-ENT-18: lo implementa la Fachada de identidad (CLAUDE.md, regla 4). */
export interface ConsultaVinculos {
  alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean>;
}
