// Dobles de los puertos de identidad para los tests unitarios (docs/TESTING.md: se mockea
// solo en los bordes: base de datos, hasheo y JWT). Viven fuera de src/ para no contar en la cobertura.
import type {
  EventoDominio,
  PublicadorEventos,
} from '../../src/compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type {
  EmisorTokens,
  DatosToken,
} from '../../src/modulos/identidad/dominio/usuario/emisor-tokens.puerto.js';
import type { HasheadorContrasenias } from '../../src/modulos/identidad/dominio/usuario/hasheador-contrasenias.puerto.js';
import type { RepositorioUsuarios } from '../../src/modulos/identidad/dominio/usuario/repositorio-usuarios.puerto.js';
import type { Usuario } from '../../src/modulos/identidad/dominio/usuario/usuario.entidad.js';
import type { Alumno } from '../../src/modulos/identidad/dominio/alumno/alumno.entidad.js';
import type { Documento } from '../../src/modulos/identidad/dominio/documento/documento.valor.js';
import type { GeneradorCodigos } from '../../src/modulos/identidad/dominio/profesor/generador-codigos.puerto.js';
import type { Profesor } from '../../src/modulos/identidad/dominio/profesor/profesor.entidad.js';
import type { RepositorioAlumnos } from '../../src/modulos/identidad/dominio/alumno/repositorio-alumnos.puerto.js';
import type { RepositorioProfesores } from '../../src/modulos/identidad/dominio/profesor/repositorio-profesores.puerto.js';

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

  async buscarPorUsuarioId(usuarioId: string): Promise<Profesor | null> {
    return this.profesores.find((profesor) => profesor.usuarioId === usuarioId) ?? null;
  }

  async buscarPorCodigo(codigo: string): Promise<Profesor | null> {
    return this.profesores.find((profesor) => profesor.codigo === codigo) ?? null;
  }

  async guardar(profesor: Profesor): Promise<void> {
    const indice = this.profesores.findIndex((existente) => existente.id === profesor.id);
    if (indice === -1) this.profesores.push(profesor);
    else this.profesores[indice] = profesor;
  }
}

export class RepositorioAlumnosEnMemoria implements RepositorioAlumnos {
  readonly alumnos: Alumno[] = [];

  async buscarPorId(id: string): Promise<Alumno | null> {
    return this.alumnos.find((alumno) => alumno.id === id) ?? null;
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Alumno | null> {
    return this.alumnos.find((alumno) => alumno.usuarioId === usuarioId) ?? null;
  }

  async listarPorProfesor(profesorId: string): Promise<Alumno[]> {
    return this.alumnos
      .filter((alumno) => alumno.profesorId === profesorId)
      .sort((uno, otro) =>
        `${uno.apellido} ${uno.nombre}`.localeCompare(`${otro.apellido} ${otro.nombre}`),
      );
  }

  async existePorDocumento(documento: Documento): Promise<boolean> {
    return this.alumnos.some((alumno) => alumno.documento.igualA(documento));
  }

  async guardar(alumno: Alumno): Promise<void> {
    const indice = this.alumnos.findIndex((existente) => existente.id === alumno.id);
    if (indice === -1) this.alumnos.push(alumno);
    else this.alumnos[indice] = alumno;
  }
}

/** Devuelve los códigos en el orden dado (RN-IDE-08). */
export class GeneradorCodigosFalso implements GeneradorCodigos {
  private indice = 0;

  constructor(private readonly codigos: string[]) {}

  generar(): string {
    const codigo = this.codigos[this.indice++];
    if (!codigo) throw new Error('GeneradorCodigosFalso: no quedan códigos');
    return codigo;
  }
}

/** Guarda los eventos publicados para verificarlos (patrón Observador). */
export class PublicadorEventosFalso implements PublicadorEventos {
  readonly eventos: EventoDominio[] = [];

  async publicar(evento: EventoDominio): Promise<void> {
    this.eventos.push({ ...evento });
  }
}
