/** Datos de una percepción: lo que se guarda y viaja en el evento. */
export type DatosPercepcion = {
  rpe: number | null;
  sensacionFuerza: number | null;
};

/**
 * Percepción del alumno sobre el Entrenamiento (RN-NOT-06). Es mala si el RPE es 9 o más
 * o la sensación de fuerza es 2 o menos.
 */
export class Percepcion {
  private constructor(
    readonly rpe: number | null,
    readonly sensacionFuerza: number | null,
  ) {}

  static crear(datos: DatosPercepcion): Percepcion {
    return new Percepcion(datos.rpe, datos.sensacionFuerza);
  }

  /** RN-NOT-06: RPE ≥ 9. */
  get rpeAlto(): boolean {
    return this.rpe !== null && this.rpe >= 9;
  }

  /** RN-NOT-06: sensación de fuerza ≤ 2. */
  get fuerzaBaja(): boolean {
    return this.sensacionFuerza !== null && this.sensacionFuerza <= 2;
  }

  esMala(): boolean {
    return this.rpeAlto || this.fuerzaBaja;
  }

  datos(): DatosPercepcion {
    return { rpe: this.rpe, sensacionFuerza: this.sensacionFuerza };
  }
}
