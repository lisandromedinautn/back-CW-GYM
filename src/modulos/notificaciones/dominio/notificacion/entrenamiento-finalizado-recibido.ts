import type { SeriePorDebajo } from './serie-por-debajo.valor.js';

/**
 * Contrato propio del evento EntrenamientoFinalizado, tal como lo escucha Notificaciones.
 * Solo primitivos: no se importa la clase de Entrenamiento (regla de dependencia 4).
 */
export interface EntrenamientoFinalizadoRecibido {
  nombre: 'EntrenamientoFinalizado';
  entrenamientoId: string;
  alumnoId: string;
  fin: string;
  inicio: string;
  rutina: string;
  totalSeries: number;
  seriesPorDebajo: SeriePorDebajo[];
}
