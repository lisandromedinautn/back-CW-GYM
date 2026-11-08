import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { AlumnoVinculado } from './alumno-vinculado.evento.js';
import type { Documento } from './documento.valor.js';

export interface DatosSalud {
  alturaCm: number;
  pesoKg: number;
  edad: number;
}

export interface DatosAlumno {
  id: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  domicilio: string;
  documento: Documento;
  salud: DatosSalud;
  /** Profesor vinculado (RN-IDE-09, 10). null mientras no se vincule. */
  profesorId: string | null;
}

/** Alumno (RN-IDE-05). Su modelo no depende de quién lo creó (DT-01, DT-02). */
export class Alumno {
  private constructor(private readonly datos: DatosAlumno) {}

  static crear(datos: Omit<DatosAlumno, 'id' | 'profesorId'>): Alumno {
    const faltante = (['nombre', 'apellido', 'domicilio'] as const).find(
      (campo) => !datos[campo].trim(),
    );
    if (faltante) {
      throw new ErrorDominio('RN-IDE-05', `El ${faltante} del alumno es obligatorio`);
    }
    return new Alumno({ id: randomUUID(), ...datos, salud: { ...datos.salud }, profesorId: null });
  }

  static reconstruir(datos: DatosAlumno): Alumno {
    return new Alumno({ ...datos, salud: { ...datos.salud } });
  }

  /** RN-IDE-09, 10: se vincula con un profesor si todavía no tiene uno. */
  vincularCon(profesorId: string): AlumnoVinculado {
    if (this.datos.profesorId !== null) {
      throw new ErrorDominio(
        'RN-IDE-10',
        'Ya estás vinculado con un profesor: no podés vincularte con otro',
        'conflicto',
      );
    }
    this.datos.profesorId = profesorId;
    return { nombre: 'AlumnoVinculado', alumnoId: this.id, profesorId };
  }

  /** RN-IDE-07: sin historial, el peso nuevo reemplaza al anterior. */
  actualizarPeso(pesoKg: number): void {
    this.datos.salud.pesoKg = pesoKg;
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
  get domicilio(): string {
    return this.datos.domicilio;
  }
  get documento(): Documento {
    return this.datos.documento;
  }
  get salud(): Readonly<DatosSalud> {
    return this.datos.salud;
  }
  get profesorId(): string | null {
    return this.datos.profesorId;
  }
}
