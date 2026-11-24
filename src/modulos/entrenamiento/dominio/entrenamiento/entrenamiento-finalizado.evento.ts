import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { SeriePorDebajo } from './series-por-debajo.js';

export class EntrenamientoFinalizado implements EventoDominio {
  readonly nombre = 'EntrenamientoFinalizado';
  constructor(
    readonly entrenamientoId: string,
    readonly alumnoId: string,
    readonly fin: string,
    readonly inicio: string,
    readonly rutina: string,
    readonly totalSeries: number,
    readonly seriesPorDebajo: SeriePorDebajo[],
  ) {}
}
