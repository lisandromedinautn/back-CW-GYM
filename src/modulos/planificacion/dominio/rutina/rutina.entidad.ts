import { randomUUID } from 'node:crypto';
import { Bloque, type DatosBloque } from './bloque.entidad.js';
import { TipoRutina } from '../tipo-rutina/tipo-rutina.valor.js';
import { Circuito, type DatosCircuito } from './circuito.entidad.js';
import { NombreRutina } from './nombre-rutina.valor.js';

export type { DatosBloque } from './bloque.entidad.js';
export type { DatosCircuito } from './circuito.entidad.js';

const NOMBRE_POR_DEFECTO = 'Rutina 1';

export interface DatosRutina {
  profesorUsuarioId: string;
  /** RN-PLAN-21. Si falta, vale 'Rutina 1'; el caso de uso siempre lo calcula. */
  nombre?: string;
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
    private nombreRutina: NombreRutina,
  ) {}

  /** RN-PLAN-21. */
  get nombre(): string {
    return this.nombreRutina.valor;
  }

  /** RN-PLAN-21: el nuevo nombre cumple la misma regla que el de la creación. */
  renombrar(nombre: string): void {
    this.nombreRutina = NombreRutina.crear(nombre);
  }

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
      NombreRutina.crear(datos.nombre ?? NOMBRE_POR_DEFECTO),
    );
  }

  /** Rehidrata desde la base sin volver a validar contra el catálogo. */
  static reconstruir(
    id: string,
    profesorUsuarioId: string,
    bloques: Bloque[],
    circuitos: Circuito[] = [],
    nombre: string = NOMBRE_POR_DEFECTO,
  ): Rutina {
    return new Rutina(id, profesorUsuarioId, bloques, circuitos, NombreRutina.crear(nombre));
  }
}
