import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import {
  type DatosObjetivo,
  ObjetivoPrescripto,
} from '../objetivo-prescripto/objetivo-prescripto.valor.js';
import { Pausa } from '../pausa/pausa.valor.js';
import type { EjercicioPrescripto } from './bloque.entidad.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';

export interface DatosEjercicioCircuito extends DatosObjetivo {
  ejercicio: EjercicioDelCatalogo;
}

export interface DatosCircuito {
  ejercicios: DatosEjercicioCircuito[];
  vueltas: number;
  macropausaSegundos: number;
}

export interface DatosCircuitoGuardado {
  ejercicios: (DatosObjetivo & { ejercicioId: string })[];
  vueltas: number;
  macropausaSegundos: number;
}

/**
 * Entidad interna de la Rutina. RN-PLAN-03: 2 o más ejercicios seguidos sin descanso; cada
 * vuelta es una serie (al menos una) y termina con macropausa. No tiene micropausa.
 * RN-PLAN-20: no repite ejercicios.
 */
export class Circuito {
  private constructor(
    readonly id: string,
    readonly ejercicios: readonly EjercicioPrescripto[],
    readonly vueltas: number,
    readonly macropausa: Pausa,
  ) {}

  static crear(datos: DatosCircuito): Circuito {
    if (datos.ejercicios.length < 2) {
      throw new ErrorDominio('RN-PLAN-03', 'Un circuito tiene que tener 2 o más ejercicios');
    }
    if (datos.vueltas < 1) {
      throw new ErrorDominio('RN-PLAN-03', 'Un circuito tiene que tener al menos una vuelta');
    }
    const ids = datos.ejercicios.map((e) => e.ejercicio.id);
    if (new Set(ids).size !== ids.length) {
      throw new ErrorDominio('RN-PLAN-20', 'Un circuito no puede repetir ejercicios');
    }
    return new Circuito(
      randomUUID(),
      datos.ejercicios.map((e) => ({
        ejercicioId: e.ejercicio.id,
        objetivo: ObjetivoPrescripto.para(e.ejercicio, e),
      })),
      datos.vueltas,
      Pausa.de(datos.macropausaSegundos),
    );
  }

  /** Rehidrata desde la base sin volver a validar contra el catálogo. */
  static reconstruir(id: string, datos: DatosCircuitoGuardado): Circuito {
    return new Circuito(
      id,
      datos.ejercicios.map((e) => ({
        ejercicioId: e.ejercicioId,
        objetivo: ObjetivoPrescripto.reconstruir(e),
      })),
      datos.vueltas,
      Pausa.de(datos.macropausaSegundos),
    );
  }
}
