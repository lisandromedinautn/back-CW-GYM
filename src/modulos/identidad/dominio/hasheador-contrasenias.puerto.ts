export const HASHEADOR_CONTRASENIAS = Symbol('HasheadorContrasenias');

/** Puerto técnico: la contraseña nunca se guarda en texto plano (RN-IDE-12, 14). */
export interface HasheadorContrasenias {
  hashear(contrasenia: string): Promise<string>;
  verificar(contrasenia: string, hash: string): Promise<boolean>;
}
