import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos.puerto.js';

/** RN-IDE-09: el alumno quedó vinculado al profesor que generó el código. */
export interface AlumnoVinculado extends EventoDominio {
  readonly nombre: 'AlumnoVinculado';
  readonly alumnoId: string;
  readonly profesorId: string;
}
