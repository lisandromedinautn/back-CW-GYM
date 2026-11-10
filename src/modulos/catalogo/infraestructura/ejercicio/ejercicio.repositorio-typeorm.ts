import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
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
}
