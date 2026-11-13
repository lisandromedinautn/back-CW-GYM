/**
 * Día del plan. RN-PLAN-10: tiene una rutina o es de descanso. RN-PLAN-11: su fecha es la del
 * inicio + (número − 1).
 */
export class DiaPlan {
  private constructor(
    readonly numero: number,
    readonly fecha: string,
    readonly rutinaId: string | null,
  ) {}

  static crear(numero: number, fecha: string, rutinaId: string | null): DiaPlan {
    return new DiaPlan(numero, fecha, rutinaId);
  }

  /** RN-PLAN-10: sin rutina asignada, el día es de descanso. */
  get esDescanso(): boolean {
    return this.rutinaId === null;
  }
}
