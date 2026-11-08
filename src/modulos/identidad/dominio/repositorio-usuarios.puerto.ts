import type { Usuario } from './usuario.entidad.js';

export const REPOSITORIO_USUARIOS = Symbol('RepositorioUsuarios');

export interface RepositorioUsuarios {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  guardar(usuario: Usuario): Promise<void>;
}
