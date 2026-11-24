import { Rpe } from './rpe.valor.js';
import { SensacionFuerza } from './sensacion-fuerza.valor.js';

/** Lo que el alumno percibió del entrenamiento: siempre el RPE y la sensación juntos (RN-ENT-16). */
export interface DatosPercepcion {
  rpe: number;
  sensacionFuerza: number;
}

export class Percepcion {
  private constructor(
    readonly rpe: Rpe,
    readonly sensacionFuerza: SensacionFuerza,
  ) {}

  static crear(rpe: number, sensacionFuerza: number): Percepcion {
    return new Percepcion(Rpe.crear(rpe), SensacionFuerza.crear(sensacionFuerza));
  }

  get datos(): DatosPercepcion {
    return { rpe: this.rpe.valor, sensacionFuerza: this.sensacionFuerza.valor };
  }
}
