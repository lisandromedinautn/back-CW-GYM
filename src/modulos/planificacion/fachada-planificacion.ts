import { Inject, Injectable } from '@nestjs/common';
import { ConsultarRutinaDelDia } from './aplicacion/consultar-rutina-del-dia/consultar-rutina-del-dia.caso-uso.js';

@Injectable()
export class FachadaPlanificacion {
  constructor(
    @Inject(ConsultarRutinaDelDia) private readonly rutinaDelDia: ConsultarRutinaDelDia,
  ) {}

  consultarRutinaDelDia(alumnoId: string, fecha: string) {
    return this.rutinaDelDia.consultarPorAlumnoYFecha(alumnoId, fecha);
  }
}
