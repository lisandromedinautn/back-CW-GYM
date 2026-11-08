import type { Repository } from 'typeorm';
import type { Documento } from '../dominio/documento/documento.valor.js';
import type { Profesor } from '../dominio/profesor/profesor.entidad.js';
import type { RepositorioProfesores } from '../dominio/profesor/repositorio-profesores.puerto.js';
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

  async buscarPorUsuarioId(usuarioId: string): Promise<Profesor | null> {
    const fila = await this.filas.findOneBy({ usuarioId });
    return fila ? ProfesorMapper.aDominio(fila) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<Profesor | null> {
    const fila = await this.filas.findOneBy({ codigo });
    return fila ? ProfesorMapper.aDominio(fila) : null;
  }

  async guardar(profesor: Profesor): Promise<void> {
    await this.filas.save(ProfesorMapper.aEsquema(profesor));
  }
}
