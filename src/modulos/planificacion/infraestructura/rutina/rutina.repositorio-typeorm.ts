import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { RutinaEsquema } from './rutina.esquema.js';
import { RutinaMapper } from './rutina.mapper.js';

@Injectable()
export class RepositorioRutinasTypeorm extends RepositorioRutinas {
  constructor(
    @InjectRepository(RutinaEsquema) private readonly repositorio: Repository<RutinaEsquema>,
  ) {
    super();
  }

  async guardar(rutina: Rutina): Promise<void> {
    await this.repositorio.save(RutinaMapper.aEsquema(rutina));
  }

  async buscarPorId(id: string): Promise<Rutina | null> {
    const esquema = await this.repositorio.findOne({ where: { id }, relations: { bloques: true } });
    return esquema ? RutinaMapper.aDominio(esquema) : null;
  }
}
