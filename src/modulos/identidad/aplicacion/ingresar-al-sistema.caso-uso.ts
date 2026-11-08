import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { EmisorTokens } from '../dominio/emisor-tokens.puerto.js';
import type { HasheadorContrasenias } from '../dominio/hasheador-contrasenias.puerto.js';
import type { NombreRol } from '../dominio/rol.valor.js';
import type { RepositorioUsuarios } from '../dominio/repositorio-usuarios.puerto.js';

export interface Credenciales {
  email: string;
  contrasenia: string;
}

export interface Ingreso {
  token: string;
  rol: NombreRol;
}

export class IngresarAlSistema {
  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly hasheador: HasheadorContrasenias,
    private readonly emisor: EmisorTokens,
  ) {}

  async ejecutar({ email, contrasenia }: Credenciales): Promise<Ingreso> {
    const usuario = await this.usuarios.buscarPorEmail(email);
    const valida =
      usuario !== null && (await this.hasheador.verificar(contrasenia, usuario.hashContrasenia));
    // RN-IDE-01: el mismo error para email inexistente y contraseña incorrecta.
    if (!usuario || !valida) {
      throw new ErrorDominio('RN-IDE-01', 'Email o contraseña incorrectos', 'credenciales');
    }
    const rol = usuario.rol.valor;
    return { token: await this.emisor.emitir({ sub: usuario.id, rol }), rol };
  }
}
