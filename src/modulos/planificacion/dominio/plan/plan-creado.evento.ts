import type { EventoDominio } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';

/** Evento que emite Planificación al crear un plan: los alumnos asignados ven su plan. */
export class PlanCreado implements EventoDominio {
  readonly nombre = 'PlanCreado';

  constructor(
    readonly planId: string,
    readonly profesorUsuarioId: string,
    readonly alumnoIds: readonly string[],
  ) {}
}
