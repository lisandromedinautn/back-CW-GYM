import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';
import {
  type DatosObjetivo,
  ObjetivoPrescripto,
} from '../objetivo-prescripto/objetivo-prescripto.valor.js';
import { Pausa } from '../pausa/pausa.valor.js';

/** El ejercicio del catálogo (por id, RN-PLAN-06) con su objetivo para cada serie. */
export interface EjercicioPrescripto {
  ejercicioId: string;
  objetivo: ObjetivoPrescripto;
}

export interface DatosBloque extends DatosObjetivo {
  ejercicio: EjercicioDelCatalogo;
  series: number;
  micropausaSegundos: number;
  macropausaSegundos: number;
}

export interface DatosBloqueGuardado extends DatosObjetivo {
  ejercicioId: string;
  series: number;
  micropausaSegundos: number;
  macropausaSegundos: number;
}

/**
 * Entidad interna de la Rutina. RN-PLAN-02: un ejercicio prescripto, N series (N ≥ 1),
 * una micropausa entre series y una macropausa al final.
 */
export class Bloque {
  private constructor(
    readonly id: string,
    readonly ejercicio: EjercicioPrescripto,
    readonly series: number,
    readonly micropausa: Pausa,
    readonly macropausa: Pausa,
  ) {}

  static crear(datos: DatosBloque): Bloque {
    if (datos.series < 1) {
      throw new ErrorDominio('RN-PLAN-02', 'Un bloque tiene que tener al menos una serie');
    }
    return new Bloque(
      randomUUID(),
      {
        ejercicioId: datos.ejercicio.id,
        objetivo: ObjetivoPrescripto.para(datos.ejercicio, datos),
      },
      datos.series,
      Pausa.de(datos.micropausaSegundos),
      Pausa.de(datos.macropausaSegundos),
    );
  }

  static reconstruir(id: string, datos: DatosBloqueGuardado): Bloque {
    return new Bloque(
      id,
      { ejercicioId: datos.ejercicioId, objetivo: ObjetivoPrescripto.reconstruir(datos) },
      datos.series,
      Pausa.de(datos.micropausaSegundos),
      Pausa.de(datos.macropausaSegundos),
    );
  }
}
