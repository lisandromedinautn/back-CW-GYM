import { Logger } from '@nestjs/common';
import type {
  EventoDominio,
  PublicadorEventos,
} from '../../dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { SuscriptorEventos } from '../../dominio/publicador-eventos/suscriptor-eventos.puerto.js';

type Manejador = (evento: EventoDominio) => Promise<void>;

/**
 * Bus de eventos en proceso: registra el evento en el log y ejecuta, en orden, los manejadores
 * suscriptos. Un manejador que falla no corta la publicación (RN-NOT-01).
 */
export class PublicadorEventosEnProceso implements PublicadorEventos, SuscriptorEventos {
  private readonly logger = new Logger('Eventos');
  private readonly manejadores = new Map<string, Manejador[]>();

  suscribir(nombre: string, manejador: Manejador): void {
    const lista = this.manejadores.get(nombre) ?? [];
    lista.push(manejador);
    this.manejadores.set(nombre, lista);
  }

  async publicar(evento: EventoDominio): Promise<void> {
    this.logger.log(`${evento.nombre} ${JSON.stringify(evento)}`);
    for (const manejador of this.manejadores.get(evento.nombre) ?? []) {
      try {
        await manejador(evento);
      } catch (error) {
        this.logger.error(
          `Falló un manejador de ${evento.nombre}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
