import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
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

/** Un paso de la secuencia de la rutina (RN-PLAN-01): un bloque o un circuito. */
export type ElementoRutina =
  { tipo: 'bloque'; bloque: Bloque } | { tipo: 'circuito'; circuito: Circuito };

/** Posición (1..N) de cada bloque y circuito dentro de la rutina, tal como se guardó. */
export interface OrdenesGuardados {
  bloques: number[];
  circuitos: number[];
}

/**
 * RN-PLAN-01 (US10): arma la secuencia con la posición de cada bloque y circuito. Sin posiciones,
 * van los bloques y después los circuitos, cada lista en su orden. Con posiciones, tienen que
 * venir en todos y ser exactamente 1..N, sin repetir ni saltear.
 */
function secuenciar(
  bloques: Bloque[],
  ordenesBloques: (number | undefined)[],
  circuitos: Circuito[],
  ordenesCircuitos: (number | undefined)[],
): ElementoRutina[] {
  const elementos: ElementoRutina[] = [
    ...bloques.map((bloque) => ({ tipo: 'bloque' as const, bloque })),
    ...circuitos.map((circuito) => ({ tipo: 'circuito' as const, circuito })),
  ];
  const ordenes = [...ordenesBloques, ...ordenesCircuitos];
  if (ordenes.every((orden) => orden === undefined)) return elementos;

  const completos = ordenes.filter((orden): orden is number => orden !== undefined);
  const esperados = elementos.map((_, indice) => indice + 1);
  const ordenados = [...completos].sort((a, b) => a - b);
  if (
    completos.length !== elementos.length ||
    ordenados.some((orden, indice) => orden !== esperados[indice])
  ) {
    throw new ErrorDominio(
      'RN-PLAN-01',
      'El orden de bloques y circuitos tiene que ir de 1 a N, sin repetir ni saltear',
    );
  }
  return elementos
    .map((elemento, indice) => ({ elemento, orden: completos[indice] }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ elemento }) => elemento);
}

/**
 * Agregado Rutina. RN-PLAN-01: secuencia ordenada de bloques y/o circuitos, con al menos uno.
 * El tipo se deriva del contenido. US10: bloques y circuitos comparten una única secuencia.
 */
export class Rutina {
  private constructor(
    readonly id: string,
    /** Usuario con rol Profesor que la creó (sale del JWT). */
    readonly profesorUsuarioId: string,
    /** RN-PLAN-01: bloques y circuitos en el orden de la rutina. */
    readonly elementos: readonly ElementoRutina[],
    private nombreRutina: NombreRutina,
  ) {}

  /** Los bloques de la rutina, en su orden relativo. */
  get bloques(): readonly Bloque[] {
    return this.elementos.flatMap((e) => (e.tipo === 'bloque' ? [e.bloque] : []));
  }

  /** Los circuitos de la rutina, en su orden relativo. */
  get circuitos(): readonly Circuito[] {
    return this.elementos.flatMap((e) => (e.tipo === 'circuito' ? [e.circuito] : []));
  }

  /** Posición (1..N) del bloque o circuito dentro de la rutina (RN-PLAN-01). */
  ordenDe(parte: Bloque | Circuito): number {
    return (
      this.elementos.findIndex((e) => (e.tipo === 'bloque' ? e.bloque : e.circuito) === parte) + 1
    );
  }

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
      secuenciar(
        bloques.map((bloque) => Bloque.crear(bloque)),
        bloques.map((bloque) => bloque.orden),
        circuitos.map((circuito) => Circuito.crear(circuito)),
        circuitos.map((circuito) => circuito.orden),
      ),
      NombreRutina.crear(datos.nombre ?? NOMBRE_POR_DEFECTO),
    );
  }

  /**
   * Rehidrata desde la base sin volver a validar contra el catálogo. Sin `ordenes`, van los
   * bloques y después los circuitos.
   */
  static reconstruir(
    id: string,
    profesorUsuarioId: string,
    bloques: Bloque[],
    circuitos: Circuito[] = [],
    nombre: string = NOMBRE_POR_DEFECTO,
    ordenes?: OrdenesGuardados,
  ): Rutina {
    return new Rutina(
      id,
      profesorUsuarioId,
      secuenciar(bloques, ordenes?.bloques ?? [], circuitos, ordenes?.circuitos ?? []),
      NombreRutina.crear(nombre),
    );
  }
}
