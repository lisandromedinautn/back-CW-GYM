export const PUBLICADOR_EVENTOS = Symbol('PublicadorEventos');

/** Evento de dominio: hecho del pasado que otros módulos pueden escuchar (patrón Observador). */
export interface EventoDominio {
  readonly nombre: string;
}

export interface PublicadorEventos {
  publicar(evento: EventoDominio): Promise<void>;
}
