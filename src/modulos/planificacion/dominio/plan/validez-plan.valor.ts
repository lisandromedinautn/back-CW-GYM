import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { esFechaValida, fechaIso, sumarDias } from './fechas.js';

/** RN-PLAN-09: el plan siempre tiene 28 días. */
export const DIAS_DEL_PLAN = 28;

/**
 * Objeto de valor ValidezPlan. RN-PLAN-09: la fecha de fin es siempre inicio + 27 días y no se
 * configura. RN-PLAN-15: el plan está vigente entre inicio y fin, ambos incluidos.
 */
export class ValidezPlan {
  private constructor(
    readonly inicio: string,
    readonly fin: string,
  ) {}

  static crear(inicio: string): ValidezPlan {
    if (!esFechaValida(inicio)) {
      throw new ErrorDominio('RN-PLAN-09', 'La fecha de inicio del plan no es válida');
    }
    return new ValidezPlan(inicio, sumarDias(inicio, DIAS_DEL_PLAN - 1));
  }

  /** Rehidrata desde la base: la fecha de fin ya quedó calculada al crear el plan. */
  static reconstruir(inicio: string, fin: string): ValidezPlan {
    return new ValidezPlan(inicio, fin);
  }

  get dias(): number {
    return DIAS_DEL_PLAN;
  }

  /** RN-PLAN-11: el día 1 es el inicio y el día 28 es el fin. */
  fechaDelDia(numero: number): string {
    return sumarDias(this.inicio, numero - 1);
  }

  /** RN-PLAN-15. */
  estaVigente(fecha: Date): boolean {
    const hoy = fechaIso(fecha);
    return hoy >= this.inicio && hoy <= this.fin;
  }
}
