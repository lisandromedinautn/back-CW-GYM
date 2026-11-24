import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import {
  SUSCRIPTOR_EVENTOS,
  type SuscriptorEventos,
} from '../../../../compartido/dominio/publicador-eventos/suscriptor-eventos.puerto.js';
import { NotificarEntrenamientoPorDebajo } from '../../aplicacion/notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';

/** Adaptador de entrada disparado por un evento (Observador): US21. */
@Injectable()
export class EntrenamientoFinalizadoSuscriptor implements OnModuleInit {
  constructor(
    @Inject(SUSCRIPTOR_EVENTOS) private readonly suscriptor: SuscriptorEventos,
    @Inject(NotificarEntrenamientoPorDebajo)
    private readonly notificar: NotificarEntrenamientoPorDebajo,
  ) {}

  onModuleInit(): void {
    this.suscriptor.suscribir('EntrenamientoFinalizado', (evento) =>
      this.notificar.ejecutar(evento as unknown as EntrenamientoFinalizadoRecibido),
    );
  }
}
