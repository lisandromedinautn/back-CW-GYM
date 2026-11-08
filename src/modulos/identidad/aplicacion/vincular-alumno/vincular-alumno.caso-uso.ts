import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { RepositorioAlumnos } from '../../dominio/alumno/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../../dominio/profesor/repositorio-profesores.puerto.js';

export interface Vinculo {
  profesor: { nombre: string; apellido: string };
}

/** US05: el alumno ingresa el código de su profesor y queda vinculado. */
export class VincularAlumno {
  constructor(
    private readonly alumnos: RepositorioAlumnos,
    private readonly profesores: RepositorioProfesores,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(usuarioId: string, codigo: string): Promise<Vinculo> {
    const alumno = await this.alumnos.buscarPorUsuarioId(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'No se encontró el alumno', 'no-encontrado');

    // RN-IDE-11: solo el código vigente encuentra al profesor; el regenerado ya no está.
    const profesor = await this.profesores.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!profesor) throw new ErrorDominio('RN-IDE-11', 'El código de profesor no es válido');

    const evento = alumno.vincularCon(profesor.id);
    await this.alumnos.guardar(alumno);
    await this.publicador.publicar(evento);
    return { profesor: { nombre: profesor.nombre, apellido: profesor.apellido } };
  }
}
