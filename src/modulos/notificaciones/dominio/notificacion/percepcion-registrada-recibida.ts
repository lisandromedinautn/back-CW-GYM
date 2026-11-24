/**
 * Contrato propio del evento PercepcionRegistrada, tal como lo escucha Notificaciones.
 * Solo primitivos: no se importa la clase de Entrenamiento (regla de dependencia 4).
 */
export interface PercepcionRegistradaRecibida {
  nombre: 'PercepcionRegistrada';
  entrenamientoId: string;
  alumnoId: string;
  inicio: string;
  rutina: string;
  totalSeries: number;
  percepcion: { rpe: number | null; sensacionFuerza: number | null };
}
