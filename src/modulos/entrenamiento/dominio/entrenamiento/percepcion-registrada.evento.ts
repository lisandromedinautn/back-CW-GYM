import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';

export class PercepcionRegistrada implements EventoDominio {
  readonly nombre = 'PercepcionRegistrada';
  constructor(
    readonly entrenamientoId: string,
    readonly alumnoId: string,
    readonly inicio: string,
    readonly rutina: string,
    readonly totalSeries: number,
    readonly percepcion: { rpe: number; sensacionFuerza: number },
  ) {}
}
