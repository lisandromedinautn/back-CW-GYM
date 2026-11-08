import type { Semilla } from '../../../../compartido/aplicacion/semilla/semilla.js';
import type { HasheadorContrasenias } from '../../dominio/usuario/hasheador-contrasenias.puerto.js';
import type { RepositorioAlumnos } from '../../dominio/alumno/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../../dominio/profesor/repositorio-profesores.puerto.js';
import type { RepositorioUsuarios } from '../../dominio/usuario/repositorio-usuarios.puerto.js';
import { Alumno } from '../../dominio/alumno/alumno.entidad.js';
import { Documento } from '../../dominio/documento/documento.valor.js';
import { Profesor } from '../../dominio/profesor/profesor.entidad.js';
import { Rol } from '../../dominio/rol/rol.valor.js';
import { Usuario } from '../../dominio/usuario/usuario.entidad.js';
import { ALUMNOS_SEMILLA, PROFESORES_SEMILLA } from './datos-semilla-usuarios.js';

const email = (prefijo: string, indice: number) =>
  `${prefijo}${String(indice + 1).padStart(2, '0')}@cwgym.test`;

export interface ConfiguracionSemillaUsuarios {
  contrasenia?: string;
}

export class SembrarUsuarios implements Semilla {
  readonly nombre = 'Profesores y alumnos de prueba (RN-IDE-12)';

  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly profesores: RepositorioProfesores,
    private readonly alumnos: RepositorioAlumnos,
    private readonly hasheador: HasheadorContrasenias,
    private readonly config: ConfiguracionSemillaUsuarios,
  ) {}

  async ejecutar(): Promise<void> {
    const contrasenia = this.config.contrasenia;
    if (!contrasenia) throw new Error('Falta la variable de entorno SEMILLA_CONTRASENIA');
    const hash = await this.hasheador.hashear(contrasenia);

    for (const [indice, datos] of PROFESORES_SEMILLA.entries()) {
      const documento = Documento.crear('DNI', datos.dni);
      const usuarioId = await this.crearUsuario(
        email('profesor', indice),
        hash,
        'Profesor',
        documento,
      );
      if (!usuarioId) continue;
      await this.profesores.guardar(
        Profesor.crear({
          usuarioId,
          nombre: datos.nombre,
          apellido: datos.apellido,
          documento,
          legajo: datos.legajo,
        }),
      );
    }

    for (const [indice, datos] of ALUMNOS_SEMILLA.entries()) {
      const documento = Documento.crear('DNI', datos.dni);
      const usuarioId = await this.crearUsuario(email('alumno', indice), hash, 'Alumno', documento);
      if (!usuarioId) continue;
      const { alturaCm, pesoKg, edad } = datos;
      await this.alumnos.guardar(
        Alumno.crear({
          usuarioId,
          nombre: datos.nombre,
          apellido: datos.apellido,
          domicilio: datos.domicilio,
          documento,
          salud: { alturaCm, pesoKg, edad },
        }),
      );
    }
  }

  /** Crea el usuario si ni el email (RN-IDE-13) ni el documento (RN-IDE-06) existen. Si no, devuelve null. */
  private async crearUsuario(
    email: string,
    hash: string,
    rol: 'Profesor' | 'Alumno',
    documento: Documento,
  ): Promise<string | null> {
    const existe =
      (await this.usuarios.buscarPorEmail(email)) !== null ||
      (await this.profesores.existePorDocumento(documento)) ||
      (await this.alumnos.existePorDocumento(documento));
    if (existe) return null;
    const usuario = Usuario.crear({ email, hashContrasenia: hash, rol: Rol.desde(rol) });
    await this.usuarios.guardar(usuario);
    return usuario.id;
  }
}
