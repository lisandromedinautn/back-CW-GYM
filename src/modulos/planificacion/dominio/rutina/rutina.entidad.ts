import { randomUUID } from 'node:crypto';
import { Bloque, type DatosBloque } from './bloque.entidad.js';
import { TipoRutina } from '../tipo-rutina/tipo-rutina.valor.js';

export type { DatosBloque } from './bloque.entidad.js';

export interface DatosRutina {
  profesorUsuarioId: string;
  bloques: DatosBloque[];
}

/**
 * Agregado Rutina. RN-PLAN-01: secuencia ordenada de bloques (por ahora; los circuitos
 * llegan con US09), con al menos uno. El tipo se deriva del contenido.
 */
export class Rutina {
  private constructor(
    readonly id: string,
    /** Usuario con rol Profesor que la creó (sale del JWT). */
    readonly profesorUsuarioId: string,
    readonly bloques: readonly Bloque[],
  ) {}

  get tipo(): TipoRutina {
    return TipoRutina.derivar(this.bloques.length);
  }

  /** RN-PLAN-01 (al menos un bloque, en el orden dado); cada bloque valida RN-PLAN-02, 04 y 05. */
  static crear(datos: DatosRutina): Rutina {
    TipoRutina.derivar(datos.bloques.length);
    return new Rutina(
      randomUUID(),
      datos.profesorUsuarioId,
      datos.bloques.map((bloque) => Bloque.crear(bloque)),
    );
  }

  /** Rehidrata desde la base sin volver a validar contra el catálogo. */
  static reconstruir(id: string, profesorUsuarioId: string, bloques: Bloque[]): Rutina {
    return new Rutina(id, profesorUsuarioId, bloques);
  }
}
