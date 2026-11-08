import type { Repository } from 'typeorm';
import type { RepositorioUsuarios } from '../../dominio/usuario/repositorio-usuarios.puerto.js';
import type { Usuario } from '../../dominio/usuario/usuario.entidad.js';
import type { UsuarioEsquema } from './usuario.esquema.js';
import { UsuarioMapper } from './usuario.mapper.js';

export class RepositorioUsuariosTypeorm implements RepositorioUsuarios {
  constructor(private readonly filas: Repository<UsuarioEsquema>) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const fila = await this.filas.findOneBy({ email });
    return fila ? UsuarioMapper.aDominio(fila) : null;
  }

  async guardar(usuario: Usuario): Promise<void> {
    await this.filas.save(UsuarioMapper.aEsquema(usuario));
  }
}
