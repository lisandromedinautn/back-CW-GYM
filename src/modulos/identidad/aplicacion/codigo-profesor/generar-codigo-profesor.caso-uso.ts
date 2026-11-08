import { buscarProfesorDelUsuario } from './buscar-profesor.js';
import type { GeneradorCodigos } from '../../dominio/profesor/generador-codigos.puerto.js';
import type { RepositorioProfesores } from '../../dominio/profesor/repositorio-profesores.puerto.js';

/** US04: el profesor genera (o regenera) su Código de Profesor. */
export class GenerarCodigoProfesor {
  constructor(
    private readonly profesores: RepositorioProfesores,
    private readonly generador: GeneradorCodigos,
  ) {}

  async ejecutar(usuarioId: string): Promise<string> {
    const profesor = await buscarProfesorDelUsuario(this.profesores, usuarioId);
    profesor.asignarCodigo(this.generador.generar());
    await this.profesores.guardar(profesor);
    return profesor.codigo as string;
  }
}
