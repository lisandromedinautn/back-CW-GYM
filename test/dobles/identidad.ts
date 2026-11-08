// Dobles de los puertos de identidad para los tests unitarios (docs/TESTING.md: se mockea
// solo en los bordes: base de datos, hasheo y JWT). Viven fuera de src/ para no contar en la cobertura.
import type {
  EmisorTokens,
  DatosToken,
} from '../../src/modulos/identidad/dominio/emisor-tokens.puerto.js';
import type { HasheadorContrasenias } from '../../src/modulos/identidad/dominio/hasheador-contrasenias.puerto.js';
import type { RepositorioUsuarios } from '../../src/modulos/identidad/dominio/repositorio-usuarios.puerto.js';
import type { Usuario } from '../../src/modulos/identidad/dominio/usuario.entidad.js';
import type { Alumno } from '../../src/modulos/identidad/dominio/alumno.entidad.js';
import type { Documento } from '../../src/modulos/identidad/dominio/documento.valor.js';
import type { Profesor } from '../../src/modulos/identidad/dominio/profesor.entidad.js';
import type { RepositorioAlumnos } from '../../src/modulos/identidad/dominio/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../../src/modulos/identidad/dominio/repositorio-profesores.puerto.js';

export class RepositorioUsuariosEnMemoria implements RepositorioUsuarios {
  readonly usuarios: Usuario[] = [];

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.email === email) ?? null;
  }

  async guardar(usuario: Usuario): Promise<void> {
    const indice = this.usuarios.findIndex((existente) => existente.id === usuario.id);
    if (indice === -1) this.usuarios.push(usuario);
    else this.usuarios[indice] = usuario;
  }
}

/** Hashea envolviendo el texto: `hash(Admin1234)`. Determinista para poder usar literales. */
export class HasheadorFalso implements HasheadorContrasenias {
  async hashear(contrasenia: string): Promise<string> {
    return `hash(${contrasenia})`;
  }

  async verificar(contrasenia: string, hash: string): Promise<boolean> {
    return hash === `hash(${contrasenia})`;
  }
}

/** Emite `token:<sub>:<rol>` para poder verificar el contenido del JWT con un literal. */
export class EmisorTokensFalso implements EmisorTokens {
  async emitir(datos: DatosToken): Promise<string> {
    return `token:${datos.sub}:${datos.rol}`;
  }
}

export class RepositorioProfesoresEnMemoria implements RepositorioProfesores {
  readonly profesores: Profesor[] = [];

  async existePorLegajo(legajo: string): Promise<boolean> {
    return this.profesores.some((profesor) => profesor.legajo === legajo);
  }

  async existePorDocumento(documento: Documento): Promise<boolean> {
    return this.profesores.some((profesor) => profesor.documento.igualA(documento));
  }

  async guardar(profesor: Profesor): Promise<void> {
    this.profesores.push(profesor);
  }
}

export class RepositorioAlumnosEnMemoria implements RepositorioAlumnos {
  readonly alumnos: Alumno[] = [];

  async existePorDocumento(documento: Documento): Promise<boolean> {
    return this.alumnos.some((alumno) => alumno.documento.igualA(documento));
  }

  async guardar(alumno: Alumno): Promise<void> {
    const indice = this.alumnos.findIndex((existente) => existente.id === alumno.id);
    if (indice === -1) this.alumnos.push(alumno);
    else this.alumnos[indice] = alumno;
  }
}
