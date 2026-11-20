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
