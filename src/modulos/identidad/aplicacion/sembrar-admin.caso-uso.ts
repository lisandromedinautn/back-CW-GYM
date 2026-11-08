import type { Semilla } from '../../../compartido/aplicacion/semilla.js';
import type { HasheadorContrasenias } from '../dominio/hasheador-contrasenias.puerto.js';
import type { RepositorioUsuarios } from '../dominio/repositorio-usuarios.puerto.js';
import { Rol } from '../dominio/rol.valor.js';
import { Usuario } from '../dominio/usuario.entidad.js';

export interface ConfiguracionAdmin {
  email?: string;
  contrasenia?: string;
}

export class SembrarAdmin implements Semilla {
  readonly nombre = 'Admin inicial (RN-IDE-14)';

  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly hasheador: HasheadorContrasenias,
    private readonly config: ConfiguracionAdmin,
  ) {}

  async ejecutar(): Promise<void> {
    const email = this.config.email?.trim();
    if (!email) throw new Error('Falta la variable de entorno ADMIN_EMAIL');
    const contrasenia = this.config.contrasenia;
    if (!contrasenia) throw new Error('Falta la variable de entorno ADMIN_PASSWORD');

    if (await this.usuarios.buscarPorEmail(email)) return;

    await this.usuarios.guardar(
      Usuario.crear({
        email,
        hashContrasenia: await this.hasheador.hashear(contrasenia),
        rol: Rol.desde('Admin'),
      }),
    );
  }
}
