import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { BloqueRutinaEsquema, CircuitoRutinaEsquema, RutinaEsquema } from './rutina.esquema.js';
import { RutinaMapper } from './rutina.mapper.js';

@Injectable()
export class RepositorioRutinasTypeorm extends RepositorioRutinas {
  constructor(
    @InjectRepository(RutinaEsquema) private readonly repositorio: Repository<RutinaEsquema>,
  ) {
    super();
  }

  /**
   * RN-PLAN-07: al editar cambian los bloques y circuitos, así que se borran los anteriores y se
   * guardan los de la rutina, en una transacción. Los ejercicios de circuito caen en cascada.
   */
  async guardar(rutina: Rutina): Promise<void> {
    await this.repositorio.manager.transaction(async (manager) => {
      for (const esquema of [BloqueRutinaEsquema, CircuitoRutinaEsquema]) {
        await manager
          .createQueryBuilder()
          .delete()
          .from(esquema)
          .where('rutina_id = :id', { id: rutina.id })
          .execute();
      }
      await manager.save(RutinaMapper.aEsquema(rutina));
    });
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
