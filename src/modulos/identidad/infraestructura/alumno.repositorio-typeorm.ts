import type { Repository } from 'typeorm';
import type { Alumno } from '../dominio/alumno/alumno.entidad.js';
import type { Documento } from '../dominio/documento/documento.valor.js';
import type { RepositorioAlumnos } from '../dominio/alumno/repositorio-alumnos.puerto.js';
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

  async buscarPorUsuarioId(usuarioId: string): Promise<Alumno | null> {
    const fila = await this.filas.findOneBy({ usuarioId });
    return fila ? AlumnoMapper.aDominio(fila) : null;
  }

  async guardar(alumno: Alumno): Promise<void> {
    await this.filas.save(AlumnoMapper.aEsquema(alumno));
  }
}
