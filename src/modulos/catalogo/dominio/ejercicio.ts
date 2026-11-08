import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { FactorPesoCorporal } from './factor-peso-corporal.js';
import type { Musculo } from './musculo.js';
import type { TipoCarga } from './tipo-carga.js';
import type { TipoEjercicio } from './tipo-ejercicio.js';

export interface DatosEjercicio {
  idDataset: string;
  nombre: string;
  descripcion: string;
  tipo: TipoEjercicio;
  tipoCarga: TipoCarga;
  factorPesoCorporal?: FactorPesoCorporal | null;
  musculoPrincipal: Musculo;
  musculoSecundario?: Musculo | null;
  urlGif: string;
  atribucion: string;
}

/** RN-CAT-01: nombre, descripción, tipo, tipo de carga y músculo principal son obligatorios; el músculo secundario es opcional. */
export class Ejercicio {
  private constructor(
    readonly id: string,
    readonly idDataset: string,
    readonly nombre: string,
    readonly descripcion: string,
    readonly tipo: TipoEjercicio,
    readonly tipoCarga: TipoCarga,
    readonly factorPesoCorporal: FactorPesoCorporal | null,
    readonly musculoPrincipal: Musculo,
    readonly musculoSecundario: Musculo | null,
    readonly urlGif: string,
    readonly atribucion: string,
  ) {}

  static crear(datos: DatosEjercicio): Ejercicio {
    if (datos.nombre.trim() === '') {
      throw new ErrorDominio('RN-CAT-01', 'El ejercicio tiene que tener nombre');
    }
    return Ejercicio.reconstruir(randomUUID(), datos);
  }

  static reconstruir(id: string, datos: DatosEjercicio): Ejercicio {
    return new Ejercicio(
      id,
      datos.idDataset,
      datos.nombre,
      datos.descripcion,
      datos.tipo,
      datos.tipoCarga,
      datos.factorPesoCorporal ?? null,
      datos.musculoPrincipal,
      datos.musculoSecundario ?? null,
      datos.urlGif,
      datos.atribucion,
    );
  }
}
