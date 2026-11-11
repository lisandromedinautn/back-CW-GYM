import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
import type { FiltrosEjercicios } from '../../dominio/ejercicio/filtros-ejercicios.js';
import { musculosDelGrupo } from '../../dominio/musculo/musculo.valor.js';
import { RepositorioEjercicios } from '../../dominio/ejercicio/repositorio-ejercicios.puerto.js';
import { EjercicioEsquema } from './ejercicio.esquema.js';
import { EjercicioMapper } from './ejercicio.mapper.js';

@Injectable()
export class RepositorioEjerciciosTypeorm extends RepositorioEjercicios {
  constructor(
    @InjectRepository(EjercicioEsquema) private readonly repositorio: Repository<EjercicioEsquema>,
  ) {
    super();
  }

  async guardar(ejercicio: Ejercicio): Promise<void> {
    await this.repositorio.save(EjercicioMapper.aEsquema(ejercicio));
  }

  existePorIdDataset(idDataset: string): Promise<boolean> {
    return this.repositorio.existsBy({ idDataset });
  }

  existePorNombre(nombre: string): Promise<boolean> {
    return this.repositorio.existsBy({ nombre });
  }

  override async buscarPorId(id: string): Promise<Ejercicio | null> {
    const esquema = await this.repositorio.findOneBy({ id });
    return esquema ? EjercicioMapper.aDominio(esquema) : null;
  }

  async listar(): Promise<Ejercicio[]> {
    const esquemas = await this.repositorio.find();
    return esquemas.map((esquema) => EjercicioMapper.aDominio(esquema));
  }

  override async consultar(
    filtros: FiltrosEjercicios,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Ejercicio[]; total: number }> {
    const consulta = this.repositorio.createQueryBuilder('e');
    if (filtros.busqueda !== undefined) {
      // Se escapan los comodines de LIKE para que la búsqueda sea literal ("contiene").
      const literal = filtros.busqueda.replace(/[\\%_]/g, '\\$&');
      consulta.andWhere("e.nombre ILIKE :busqueda ESCAPE '\\'", { busqueda: `%${literal}%` });
    }
    if (filtros.grupoMuscular !== undefined) {
      consulta.andWhere('e.musculoPrincipal IN (:...delGrupo)', {
        delGrupo: musculosDelGrupo(filtros.grupoMuscular),
      });
    }
    if (filtros.musculo !== undefined) {
      consulta.andWhere('e.musculoPrincipal = :musculo', { musculo: filtros.musculo });
    }
    if (filtros.tipo !== undefined) {
      consulta.andWhere('e.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.tipoCarga !== undefined) {
      consulta.andWhere('e.tipoCarga = :tipoCarga', { tipoCarga: filtros.tipoCarga });
    }
    const [esquemas, total] = await consulta
      .orderBy('LOWER(e.nombre)', 'ASC')
      .addOrderBy('e.id', 'ASC')
      .skip((pagina - 1) * tamanio)
      .take(tamanio)
      .getManyAndCount();
    return { items: esquemas.map((esquema) => EjercicioMapper.aDominio(esquema)), total };
  }
}
