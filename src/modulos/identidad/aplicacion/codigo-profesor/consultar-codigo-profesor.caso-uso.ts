import { buscarProfesorDelUsuario } from './buscar-profesor.js';
import type { RepositorioProfesores } from '../../dominio/profesor/repositorio-profesores.puerto.js';

/** US04: el profesor ve su código vigente para copiarlo. */
export class ConsultarCodigoProfesor {
  constructor(private readonly profesores: RepositorioProfesores) {}

  async ejecutar(usuarioId: string): Promise<string | null> {
    return (await buscarProfesorDelUsuario(this.profesores, usuarioId)).codigo;
  }
}
