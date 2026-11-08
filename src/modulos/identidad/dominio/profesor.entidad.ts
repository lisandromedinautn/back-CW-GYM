import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { Documento } from './documento.valor.js';

export interface DatosProfesor {
  id: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  documento: Documento;
  legajo: string;
}

/** Profesor (RN-IDE-04). El legajo es único: lo controla el caso de uso con el repositorio. */
export class Profesor {
  private constructor(private readonly datos: DatosProfesor) {}

  static crear(datos: Omit<DatosProfesor, 'id'>): Profesor {
    if (!datos.legajo.trim()) {
      throw new ErrorDominio('RN-IDE-04', 'El legajo del profesor es obligatorio');
    }
    return new Profesor({ id: randomUUID(), ...datos, legajo: datos.legajo.trim() });
  }

  static reconstruir(datos: DatosProfesor): Profesor {
    return new Profesor({ ...datos });
  }

  get id(): string {
    return this.datos.id;
  }
  get usuarioId(): string {
    return this.datos.usuarioId;
  }
  get nombre(): string {
    return this.datos.nombre;
  }
  get apellido(): string {
    return this.datos.apellido;
  }
  get documento(): Documento {
    return this.datos.documento;
  }
  get legajo(): string {
    return this.datos.legajo;
  }
}
