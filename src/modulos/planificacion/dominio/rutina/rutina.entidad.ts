import { randomUUID } from 'node:crypto';
import { Bloque, type DatosBloque } from './bloque.entidad.js';
import { TipoRutina } from '../tipo-rutina/tipo-rutina.valor.js';
import { Circuito, type DatosCircuito } from './circuito.entidad.js';

export type { DatosBloque } from './bloque.entidad.js';
export type { DatosCircuito } from './circuito.entidad.js';

export interface DatosRutina {
  profesorUsuarioId: string;
  bloques?: DatosBloque[];
  circuitos?: DatosCircuito[];
}

/**
 * Agregado Rutina. RN-PLAN-01: secuencia ordenada de bloques y/o circuitos, con al menos uno.
 * El tipo se deriva del contenido. Hoy bloques y circuitos se guardan en listas separadas,
 * cada una en su orden; el orden entre ellos (rutina mixta) se resuelve en US10.
 */
export class Rutina {
  private constructor(
    readonly id: string,
    /** Usuario con rol Profesor que la creó (sale del JWT). */
    readonly profesorUsuarioId: string,
    readonly bloques: readonly Bloque[],
    readonly circuitos: readonly Circuito[],
  ) {}

  get tipo(): TipoRutina {
    return TipoRutina.derivar(this.bloques.length, this.circuitos.length);
  }

  /**
   * RN-PLAN-01: al menos un bloque o un circuito, en el orden dado. Cada bloque valida
   * RN-PLAN-02, 04 y 05; cada circuito, RN-PLAN-03, 04, 05 y 20.
   */
  static crear(datos: DatosRutina): Rutina {
    const bloques = datos.bloques ?? [];
    const circuitos = datos.circuitos ?? [];
    TipoRutina.derivar(bloques.length, circuitos.length);
    return new Rutina(
      randomUUID(),
      datos.profesorUsuarioId,
      bloques.map((bloque) => Bloque.crear(bloque)),
      circuitos.map((circuito) => Circuito.crear(circuito)),
    );
  }

  /** Rehidrata desde la base sin volver a validar contra el catálogo. */
  static reconstruir(
    id: string,
    profesorUsuarioId: string,
    bloques: Bloque[],
    circuitos: Circuito[] = [],
  ): Rutina {
    return new Rutina(id, profesorUsuarioId, bloques, circuitos);
  }
}
