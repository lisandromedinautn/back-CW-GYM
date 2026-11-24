import type { EventoDominio } from './publicador-eventos.puerto.js';

export const SUSCRIPTOR_EVENTOS = Symbol('SuscriptorEventos');

/** Lado de escucha del patrón Observador: un módulo se suscribe a un evento por su nombre. */
export interface SuscriptorEventos {
  suscribir(nombre: string, manejador: (evento: EventoDominio) => Promise<void>): void;
}
