import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

/** RN-PLAN-01: el tipo de rutina se deriva de su contenido; no se elige. */
export class TipoRutina {
  static readonly BLOQUES = new TipoRutina('Bloques');
  static readonly CIRCUITOS = new TipoRutina('Circuitos');
  static readonly MIXTA = new TipoRutina('Mixta');

  private constructor(readonly valor: string) {}

  /** Mixta (bloques y circuitos) se testea con US10. */
  static derivar(cantidadBloques: number, cantidadCircuitos = 0): TipoRutina {
    if (cantidadBloques + cantidadCircuitos < 1) {
      throw new ErrorDominio(
        'RN-PLAN-01',
        'La rutina tiene que tener al menos un bloque o un circuito',
      );
    }
    if (cantidadCircuitos === 0) return TipoRutina.BLOQUES;
    return cantidadBloques === 0 ? TipoRutina.CIRCUITOS : TipoRutina.MIXTA;
  }
}
