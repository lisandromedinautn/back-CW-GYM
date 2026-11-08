import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';

export interface DatosObjetivo {
  repeticiones?: number | null;
  segundos?: number | null;
  pesoKg?: number | null;
}

/**
 * Lo que se le pide al alumno en cada serie: repeticiones o tiempo, más peso si corresponde.
 * El formato de los números (enteros ≥ 1, peso > 0) lo valida el DTO: no hay RN sobre eso.
 */
export class ObjetivoPrescripto {
  private constructor(
    readonly repeticiones: number | null,
    readonly segundos: number | null,
    readonly pesoKg: number | null,
  ) {}

  static para(ejercicio: EjercicioDelCatalogo, datos: DatosObjetivo): ObjetivoPrescripto {
    const repeticiones = datos.repeticiones ?? null;
    const segundos = datos.segundos ?? null;
    const pesoKg = datos.pesoKg ?? null;

    // RN-PLAN-04: por tiempo lleva solo segundos; por repeticiones, solo repeticiones.
    const correcto = ejercicio.porTiempo
      ? segundos !== null && repeticiones === null
      : repeticiones !== null && segundos === null;
    if (!correcto) {
      throw new ErrorDominio(
        'RN-PLAN-04',
        ejercicio.porTiempo
          ? 'El ejercicio es por tiempo: indicá los segundos y no las repeticiones'
          : 'El ejercicio es por repeticiones: indicá las repeticiones y no el tiempo',
      );
    }

    // RN-PLAN-05: el peso es opcional, y solo se admite si la carga incluye Peso Extra.
    if (pesoKg !== null && !ejercicio.admitePesoExtra) {
      throw new ErrorDominio(
        'RN-PLAN-05',
        'El peso solo se indica si el tipo de carga del ejercicio incluye Peso Extra',
      );
    }

    return new ObjetivoPrescripto(repeticiones, segundos, pesoKg);
  }

  /** Rehidrata desde la base sin volver a validar contra el catálogo. */
  static reconstruir(datos: DatosObjetivo): ObjetivoPrescripto {
    return new ObjetivoPrescripto(
      datos.repeticiones ?? null,
      datos.segundos ?? null,
      datos.pesoKg ?? null,
    );
  }
}
