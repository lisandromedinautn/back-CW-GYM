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

/** RN-ENT-02 (T14): el GIF de cada ejercicio para la copia. Lo implementa la Fachada de catálogo. */
export interface ConsultaEjercicios {
  obtenerEjercicio(id: string): Promise<{ urlGif: string } | null>;
}

/** RN-ENT-18: lo implementa la Fachada de identidad (CLAUDE.md, regla 4). */
export interface ConsultaVinculos {
  alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean>;
}
