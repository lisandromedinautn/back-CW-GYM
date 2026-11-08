import type { Repository } from 'typeorm';
import type { Alumno } from '../dominio/alumno.entidad.js';
import type { Documento } from '../dominio/documento.valor.js';
import type { RepositorioAlumnos } from '../dominio/repositorio-alumnos.puerto.js';
import type { AlumnoEsquema } from './alumno.esquema.js';
import { AlumnoMapper } from './alumno.mapper.js';

export class RepositorioAlumnosTypeorm implements RepositorioAlumnos {
  constructor(private readonly filas: Repository<AlumnoEsquema>) {}

  existePorDocumento(documento: Documento): Promise<boolean> {
    return this.filas.existsBy({
      tipoDocumento: documento.tipo,
      numeroDocumento: documento.numero,
    });
  }

  async guardar(alumno: Alumno): Promise<void> {
    await this.filas.save(AlumnoMapper.aEsquema(alumno));
  }
}
