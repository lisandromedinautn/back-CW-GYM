import { Injectable } from '@nestjs/common';
import { Reloj } from '../../dominio/reloj/reloj.puerto.js';

/** Reloj real del sistema. En los tests se reemplaza por un doble fijo. */
@Injectable()
export class RelojSistema extends Reloj {
  ahora(): Date {
    return new Date();
  }
}
