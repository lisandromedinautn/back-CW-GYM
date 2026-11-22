import type { CargaEfectiva } from '../carga-efectiva/carga-efectiva.valor.js';

/** 1RM estimado (RN-ENT-11): carga efectiva × (1 + repeticiones / 30). */
export class UnoRMEstimado {
  private constructor(readonly kg: number) {}

  static calcular(cargaEfectiva: CargaEfectiva, repeticiones: number): UnoRMEstimado | null {
    if (repeticiones < 1 || repeticiones > 10) return null;
    return new UnoRMEstimado(cargaEfectiva.kg * (1 + repeticiones / 30));
  }
}
