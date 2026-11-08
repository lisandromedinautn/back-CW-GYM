import { ErrorDominio } from '../../../../compartido/dominio/error-dominio.js';

export const ROLES = ['Admin', 'Profesor', 'Alumno'] as const;
export type NombreRol = (typeof ROLES)[number];

/** Rol del usuario (RN-IDE-02). */
export class Rol {
  private constructor(readonly valor: NombreRol) {}

  static desde(valor: string): Rol {
    if (!ROLES.includes(valor as NombreRol)) {
      throw new ErrorDominio(
        'RN-IDE-02',
        `El rol "${valor}" no existe: los roles son Admin, Profesor y Alumno`,
      );
    }
    return new Rol(valor as NombreRol);
  }
}
