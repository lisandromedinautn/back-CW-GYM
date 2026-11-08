import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Ejercicio } from '../dominio/ejercicio.entidad.js';
import { RepositorioEjercicios } from '../dominio/repositorio-ejercicios.puerto.js';
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

  async listar(): Promise<Ejercicio[]> {
    const esquemas = await this.repositorio.find();
    return esquemas.map((esquema) => EjercicioMapper.aDominio(esquema));
  }
}
