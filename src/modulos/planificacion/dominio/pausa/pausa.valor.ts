/**
 * Pausa de un bloque (micropausa entre series o macropausa al final), en segundos.
 * El formato (entero ≥ 0) lo valida el DTO de entrada: no hay una RN sobre la duración.
 */
export class Pausa {
  private constructor(readonly segundos: number) {}

  static de(segundos: number): Pausa {
    return new Pausa(segundos);
  }
}
