import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

const LARGO_MAXIMO = 60;

const normalizar = (texto: string): string => texto.trim().toLowerCase();

/** RN-PLAN-21: nombre de 1 a 60 caracteres sin contar los espacios de los extremos (se guarda recortado). */
export class NombreRutina {
  private constructor(readonly valor: string) {}

  static crear(texto: string): NombreRutina {
    const recortado = texto.trim();
    if (recortado.length < 1 || recortado.length > LARGO_MAXIMO) {
      throw new ErrorDominio(
        'RN-PLAN-21',
        'El nombre de la rutina tiene que tener entre 1 y 60 caracteres',
        'validacion',
      );
    }
    return new NombreRutina(recortado);
  }

  /** RN-PLAN-21: dos nombres son el mismo si coinciden sin mayúsculas y sin espacios de los extremos. */
  equivale(otro: string): boolean {
    return normalizar(this.valor) === normalizar(otro);
  }
}
