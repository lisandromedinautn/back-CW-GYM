import type { Repository } from 'typeorm';
import type { Documento } from '../dominio/documento.valor.js';
import type { Profesor } from '../dominio/profesor.entidad.js';
import type { RepositorioProfesores } from '../dominio/repositorio-profesores.puerto.js';
import type { ProfesorEsquema } from './profesor.esquema.js';
import { ProfesorMapper } from './profesor.mapper.js';

export class RepositorioProfesoresTypeorm implements RepositorioProfesores {
  constructor(private readonly filas: Repository<ProfesorEsquema>) {}

  existePorLegajo(legajo: string): Promise<boolean> {
    return this.filas.existsBy({ legajo });
  }

  existePorDocumento(documento: Documento): Promise<boolean> {
    return this.filas.existsBy({
      tipoDocumento: documento.tipo,
      numeroDocumento: documento.numero,
    });
  }

  async guardar(profesor: Profesor): Promise<void> {
    await this.filas.save(ProfesorMapper.aEsquema(profesor));
  }
}
