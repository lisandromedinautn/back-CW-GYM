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
    const esquema = await this.repositorio.findOne({
      where: { id },
      relations: { bloques: true, circuitos: { ejercicios: true } },
    });
    return esquema ? RutinaMapper.aDominio(esquema) : null;
  }

  async listarPorProfesor(
    profesorUsuarioId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Rutina[]; total: number }> {
    const [esquemas, total] = await this.repositorio.findAndCount({
      where: { profesorUsuarioId },
      relations: { bloques: true, circuitos: { ejercicios: true } },
      order: { creadaEn: 'DESC', id: 'ASC' },
      skip: (pagina - 1) * tamanio,
      take: tamanio,
    });
    return { items: esquemas.map((esquema) => RutinaMapper.aDominio(esquema)), total };
  }

  async listarTodasPorAntiguedad(): Promise<Rutina[]> {
    const esquemas = await this.repositorio.find({
      relations: { bloques: true, circuitos: { ejercicios: true } },
      order: { creadaEn: 'ASC', id: 'ASC' },
    });
    return esquemas.map((esquema) => RutinaMapper.aDominio(esquema));
  }

  async listarNombresPorProfesor(
    profesorUsuarioId: string,
  ): Promise<{ id: string; nombre: string }[]> {
    const filas = await this.repositorio.find({
      where: { profesorUsuarioId },
      select: { id: true, nombre: true },
    });
    return filas.map(({ id, nombre }) => ({ id, nombre }));
  }
}
