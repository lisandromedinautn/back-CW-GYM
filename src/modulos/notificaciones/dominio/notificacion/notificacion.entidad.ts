import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Gravedad } from './gravedad.valor.js';
import type { DatosPercepcion, Percepcion } from './percepcion.valor.js';
import type { SeriePorDebajo } from './serie-por-debajo.valor.js';

export type TipoNotificacion = 'entrenamiento' | 'alerta-incumplimiento';

/** Un Entrenamiento de la racha que origina una alerta (RN-NOT-08). */
export interface EntrenamientoDeAlerta {
  id: string;
  fecha: string;
  rutina: string;
}

export interface DatosNotificacion {
  id: string;
  tipo: TipoNotificacion;
  /** Solo en las alertas de incumplimiento: los 3 Entrenamientos, del más viejo al más nuevo. */
  entrenamientos?: EntrenamientoDeAlerta[];
  profesorId: string;
  alumno: { id: string; nombre: string; apellido: string };
  entrenamiento: { id: string; rutina: string; inicio: string };
  totalSeries: number;
  seriesPorDebajo: SeriePorDebajo[];
  gravedad: 'leve' | 'grave';
  creada: string;
  leidaEn: string | null;
  percepcion: DatosPercepcion | null;
}

export type DatosCreacionNotificacion = Omit<
  DatosNotificacion,
  'gravedad' | 'leidaEn' | 'percepcion' | 'tipo' | 'entrenamientos'
>;

export interface DatosCreacionAlertaIncumplimiento {
  id: string;
  profesorId: string;
  alumno: { id: string; nombre: string; apellido: string };
  /** Los 3 Entrenamientos seguidos por debajo, del más viejo al más nuevo. */
  entrenamientos: EntrenamientoDeAlerta[];
  creada: string;
}

export type DatosCreacionPorPercepcion = Omit<DatosCreacionNotificacion, 'seriesPorDebajo'> & {
  percepcion: Percepcion;
};

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
      tipo: 'entrenamiento',
      gravedad: gravedad.valor,
      leidaEn: null,
      percepcion: null,
    });
  }

  /** RN-NOT-01, 06: notificación sin series por debajo, solo por percepción mala. */
  static crearPorPercepcion(datos: DatosCreacionPorPercepcion): Notificacion {
    const gravedad = Gravedad.dePercepcion(datos.percepcion);
    if (gravedad === null) {
      throw new ErrorDominio(
        'RN-NOT-01',
        'Solo se notifica un entrenamiento con series por debajo o con una percepción mala',
        'validacion',
      );
    }
    const { percepcion, ...resto } = datos;
    return new Notificacion({
      ...structuredClone(resto),
      tipo: 'entrenamiento',
      seriesPorDebajo: [],
      gravedad: gravedad.valor,
      leidaEn: null,
      percepcion: percepcion.datos(),
    });
  }

  /**
   * RN-NOT-08: alerta de incumplimiento repetido. Se ancla al último de los 3 Entrenamientos,
   * es Grave, nace no leída y no tiene series ni percepción propias.
   */
  static crearAlertaIncumplimiento(datos: DatosCreacionAlertaIncumplimiento): Notificacion {
    if (datos.entrenamientos.length !== 3) {
      throw new ErrorDominio(
        'RN-NOT-08',
        'La alerta de incumplimiento se arma con exactamente 3 Entrenamientos',
        'validacion',
      );
    }
    const ultimo = datos.entrenamientos[2]!;
    return new Notificacion({
      id: datos.id,
      tipo: 'alerta-incumplimiento',
      profesorId: datos.profesorId,
      alumno: structuredClone(datos.alumno),
      entrenamiento: { id: ultimo.id, rutina: ultimo.rutina, inicio: ultimo.fecha },
      entrenamientos: structuredClone(datos.entrenamientos),
      totalSeries: 0,
      seriesPorDebajo: [],
      gravedad: 'grave',
      creada: datos.creada,
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

  /** RN-NOT-05, 07: suma la percepción, queda la gravedad mayor y vuelve a no leída. */
  sumarPercepcion(percepcion: Percepcion): void {
    const actual = Gravedad.reconstruir(this.registro.gravedad);
    this.registro.gravedad = Gravedad.mayor(actual, Gravedad.dePercepcion(percepcion)).valor;
    this.registro.percepcion = percepcion.datos();
    this.registro.leidaEn = null;
  }

  /** RN-NOT-04: idempotente. Si ya estaba leída, conserva la primera fecha de lectura. */
  marcarLeida(instante: Date): void {
    if (this.leida) return;
    this.registro.leidaEn = instante.toISOString();
  }
}
