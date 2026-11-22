import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { SerieRealizada } from './serie-realizada.valor.js';

export class EventoSerieRealizada implements EventoDominio {
  readonly nombre = 'SerieRealizada';

  constructor(
    readonly entrenamientoId: string,
    readonly alumnoId: string,
    readonly serie: SerieRealizada,
  ) {}
}
