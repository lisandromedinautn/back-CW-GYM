import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import {
  SUSCRIPTOR_EVENTOS,
  type SuscriptorEventos,
} from '../../../../compartido/dominio/publicador-eventos/suscriptor-eventos.puerto.js';
import { SumarPercepcion } from '../../aplicacion/sumar-percepcion/sumar-percepcion.caso-uso.js';
import type { PercepcionRegistradaRecibida } from '../../dominio/notificacion/percepcion-registrada-recibida.js';

/** Adaptador de entrada disparado por un evento (Observador): US17. */
@Injectable()
export class PercepcionRegistradaSuscriptor implements OnModuleInit {
  constructor(
    @Inject(SUSCRIPTOR_EVENTOS) private readonly suscriptor: SuscriptorEventos,
    @Inject(SumarPercepcion) private readonly sumar: SumarPercepcion,
  ) {}

  onModuleInit(): void {
    this.suscriptor.suscribir('PercepcionRegistrada', (evento) =>
      this.sumar.ejecutar(evento as unknown as PercepcionRegistradaRecibida),
    );
  }
}
