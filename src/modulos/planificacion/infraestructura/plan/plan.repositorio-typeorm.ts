import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import { PlanEsquema } from './plan.esquema.js';
import { PlanMapper } from './plan.mapper.js';

@Injectable()
export class RepositorioPlanesTypeorm extends RepositorioPlanes {
  constructor(
    @InjectRepository(PlanEsquema) private readonly repositorio: Repository<PlanEsquema>,
  ) {
    super();
  }

  async guardar(plan: Plan): Promise<void> {
    await this.repositorio.save(PlanMapper.aEsquema(plan));
  }

  /** RN-PLAN-14, 15: planes del alumno con la fecha actual entre inicio y fin, ambos incluidos. */
  async listarVigentesPorAlumno(alumnoId: string, fecha: string): Promise<Plan[]> {
    const filas = await this.repositorio.find({
      where: {
        fechaInicio: LessThanOrEqual(fecha),
        fechaFin: MoreThanOrEqual(fecha),
        alumnos: { alumnoId },
      },
      relations: { dias: true, alumnos: true },
      order: { creadaEn: 'DESC', id: 'ASC' },
    });
    return filas.map((fila) => PlanMapper.aDominio(fila));
  }
}
