import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Gravedad } from './gravedad.valor.js';
import type { Percepcion } from './percepcion.valor.js';
import type { SeriePorDebajo } from './serie-por-debajo.valor.js';

export interface DatosNotificacion {
  id: string;
  profesorId: string;
  alumno: { id: string; nombre: string; apellido: string };
  entrenamiento: { id: string; rutina: string; inicio: string };
  totalSeries: number;
  seriesPorDebajo: SeriePorDebajo[];
  gravedad: 'leve' | 'grave';
  creada: string;
  leidaEn: string | null;
  percepcion: Percepcion | null;
}

export type DatosCreacionNotificacion = Omit<
  DatosNotificacion,
  'gravedad' | 'leidaEn' | 'percepcion'
>;

/** Notificación al profesor de un Entrenamiento por debajo de lo prescripto (US21). */
export class Notificacion {
  private constructor(private readonly registro: DatosNotificacion) {}

  static crear(datos: DatosCreacionNotificacion): Notificacion {
    if (datos.seriesPorDebajo.length === 0) {
      throw new ErrorDominio(
        'RN-NOT-01',
        'Solo se notifica un entrenamiento con al menos una serie por debajo',
        'validacion',
      );
    }
    const gravedad = Gravedad.desde(datos.seriesPorDebajo.length, datos.totalSeries);
    return new Notificacion({
      ...structuredClone(datos),
      gravedad: gravedad.valor,
      leidaEn: null,
      percepcion: null,
    });
  }

  static reconstruir(datos: DatosNotificacion): Notificacion {
    return new Notificacion(structuredClone(datos));
  }

  get datos(): DatosNotificacion {
    return structuredClone(this.registro);
  }

  get leida(): boolean {
    return this.registro.leidaEn !== null;
  }

  /** RN-NOT-04: idempotente. Si ya estaba leída, conserva la primera fecha de lectura. */
  marcarLeida(instante: Date): void {
    if (this.leida) return;
    this.registro.leidaEn = instante.toISOString();
  }
}
