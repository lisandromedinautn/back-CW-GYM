import bcrypt from 'bcryptjs';
import type { HasheadorContrasenias } from '../../dominio/usuario/hasheador-contrasenias.puerto.js';

const COSTO = 10;

export class HasheadorBcrypt implements HasheadorContrasenias {
  hashear(contrasenia: string): Promise<string> {
    return bcrypt.hash(contrasenia, COSTO);
  }

  verificar(contrasenia: string, hash: string): Promise<boolean> {
    return bcrypt.compare(contrasenia, hash);
  }
}
