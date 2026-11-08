import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { FactorPesoCorporal } from './factor-peso-corporal.valor.js';
import type { Musculo } from './musculo.valor.js';
import type { TipoCarga } from './tipo-carga.valor.js';
import type { TipoEjercicio } from './tipo-ejercicio.valor.js';

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

/**
 * RN-CAT-06: el factor de peso corporal solo se guarda si el tipo de carga incluye peso corporal
 * (si no, queda en null). Si la carga lo incluye y no se indica, vale 100% (RN-CAT-04).
 *
 * RN-CAT-01: nombre, descripción, tipo, tipo de carga y músculo principal son obligatorios; el músculo secundario es opcional.
 */
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
      datos.tipoCarga.incluyePesoCorporal
        ? (datos.factorPesoCorporal ?? FactorPesoCorporal.crear())
        : null,
      datos.musculoPrincipal,
      datos.musculoSecundario ?? null,
      datos.urlGif,
      datos.atribucion,
    );
  }
}
