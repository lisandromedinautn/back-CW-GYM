import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';

export class EntrenamientoIniciado implements EventoDominio {
  readonly nombre = 'EntrenamientoIniciado';

  constructor(
    readonly entrenamientoId: string,
    readonly alumnoId: string,
    readonly inicio: string,
  ) {}
}
