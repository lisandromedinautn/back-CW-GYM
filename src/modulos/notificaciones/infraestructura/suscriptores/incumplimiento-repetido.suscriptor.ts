import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import {
  SUSCRIPTOR_EVENTOS,
  type SuscriptorEventos,
} from '../../../../compartido/dominio/publicador-eventos/suscriptor-eventos.puerto.js';
import { AlertarIncumplimientoRepetido } from '../../aplicacion/alertar-incumplimiento-repetido/alertar-incumplimiento-repetido.caso-uso.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';

/** Adaptador de entrada disparado por un evento (Observador): US23. */
@Injectable()
export class IncumplimientoRepetidoSuscriptor implements OnModuleInit {
  constructor(
    @Inject(SUSCRIPTOR_EVENTOS) private readonly suscriptor: SuscriptorEventos,
    @Inject(AlertarIncumplimientoRepetido)
    private readonly alertar: AlertarIncumplimientoRepetido,
  ) {}

  onModuleInit(): void {
    this.suscriptor.suscribir('EntrenamientoFinalizado', (evento) =>
      this.alertar.ejecutar(evento as unknown as EntrenamientoFinalizadoRecibido),
    );
  }
}
