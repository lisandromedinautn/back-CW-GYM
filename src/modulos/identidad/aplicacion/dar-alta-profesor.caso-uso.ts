import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { Documento } from '../dominio/documento.valor.js';
import type { HasheadorContrasenias } from '../dominio/hasheador-contrasenias.puerto.js';
import { Profesor } from '../dominio/profesor.entidad.js';
import type { RepositorioAlumnos } from '../dominio/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../dominio/repositorio-profesores.puerto.js';
import type { RepositorioUsuarios } from '../dominio/repositorio-usuarios.puerto.js';
import { Rol } from '../dominio/rol.valor.js';
import { Usuario } from '../dominio/usuario.entidad.js';

export interface DatosAltaProfesor {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  legajo: string;
  email: string;
  /** Contraseña inicial que el Admin le comunica al profesor. */
  contrasenia: string;
}

/** US02: el Admin da de alta un profesor con su usuario de ingreso. */
export class DarAltaProfesor {
  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly profesores: RepositorioProfesores,
    private readonly alumnos: RepositorioAlumnos,
    private readonly hasheador: HasheadorContrasenias,
  ) {}

  async ejecutar(datos: DatosAltaProfesor): Promise<Profesor> {
    const documento = Documento.crear(datos.tipoDocumento, datos.numeroDocumento);
    if (await this.profesores.existePorLegajo(datos.legajo.trim())) {
      throw new ErrorDominio(
        'RN-IDE-04',
        `Ya existe un profesor con el legajo ${datos.legajo}`,
        'conflicto',
      );
    }
    if (
      (await this.profesores.existePorDocumento(documento)) ||
      (await this.alumnos.existePorDocumento(documento))
    ) {
      throw new ErrorDominio(
        'RN-IDE-06',
        `Ya existe una persona con el documento ${documento.tipo} ${documento.numero}`,
        'conflicto',
      );
    }
    if (await this.usuarios.buscarPorEmail(datos.email)) {
      throw new ErrorDominio(
        'RN-IDE-13',
        `Ya existe un usuario con el email ${datos.email}`,
        'conflicto',
      );
    }
    const usuario = Usuario.crear({
      email: datos.email,
      hashContrasenia: await this.hasheador.hashear(datos.contrasenia),
      rol: Rol.desde('Profesor'),
    });
    const profesor = Profesor.crear({
      usuarioId: usuario.id,
      nombre: datos.nombre,
      apellido: datos.apellido,
      documento,
      legajo: datos.legajo,
    });
    await this.usuarios.guardar(usuario);
    await this.profesores.guardar(profesor);
    return profesor;
  }
}
