import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';

export class EntrenamientoFinalizado implements EventoDominio {
  readonly nombre = 'EntrenamientoFinalizado';
  constructor(
    readonly entrenamientoId: string,
    readonly alumnoId: string,
    readonly fin: string,
  ) {}
}
