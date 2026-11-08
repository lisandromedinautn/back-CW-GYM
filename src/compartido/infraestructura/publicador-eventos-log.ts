import { Logger } from '@nestjs/common';
import type { EventoDominio, PublicadorEventos } from '../dominio/publicador-eventos.puerto.js';

/**
 * Por ahora ningún módulo escucha eventos: se registran en el log. Cuando haya un suscriptor
 * (por ejemplo, planificación con AlumnoVinculado), se reemplaza por un bus de eventos.
 */
export class PublicadorEventosLog implements PublicadorEventos {
  private readonly logger = new Logger('Eventos');

  async publicar(evento: EventoDominio): Promise<void> {
    this.logger.log(`${evento.nombre} ${JSON.stringify(evento)}`);
  }
}
