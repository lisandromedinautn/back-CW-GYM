import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';

/** RN-PLAN-01: el tipo de rutina se deriva de su contenido; no se elige. */
export class TipoRutina {
  static readonly BLOQUES = new TipoRutina('Bloques');
  static readonly CIRCUITOS = new TipoRutina('Circuitos');
  static readonly MIXTA = new TipoRutina('Mixta');

  private constructor(readonly valor: string) {}

  /** Por ahora solo hay bloques (US06). Circuitos (US09) y Mixta (US10) se suman acá. */
  static derivar(cantidadBloques: number): TipoRutina {
    if (cantidadBloques < 1) {
      throw new ErrorDominio('RN-PLAN-01', 'La rutina tiene que tener al menos un bloque');
    }
    return TipoRutina.BLOQUES;
  }
}
