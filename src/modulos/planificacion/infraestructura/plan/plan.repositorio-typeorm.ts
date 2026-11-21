import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  type FiltrosPlanes,
  RepositorioPlanes,
} from '../../dominio/plan/repositorio-planes.puerto.js';
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

  /**
   * RN-PLAN-22: filtra, ordena y pagina en la base. Primero resuelve los ids de la página y
   * después carga los planes completos, para que el filtro por alumno no recorte `alumnoIds`.
   */
  async listarPorProfesor(
    profesorUsuarioId: string,
    filtros: FiltrosPlanes,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Plan[]; total: number }> {
    const consulta = this.repositorio
      .createQueryBuilder('plan')
      .where('plan.profesorUsuarioId = :profesorUsuarioId', { profesorUsuarioId });
    if (filtros.estado === 'proximo') {
      consulta.andWhere('plan.fechaInicio > :hoy', { hoy: filtros.hoy });
    } else if (filtros.estado === 'vigente') {
      consulta.andWhere('plan.fechaInicio <= :hoy AND plan.fechaFin >= :hoy', { hoy: filtros.hoy });
    } else if (filtros.estado === 'finalizado') {
      consulta.andWhere('plan.fechaFin < :hoy', { hoy: filtros.hoy });
    }
    if (filtros.alumnoId !== undefined) {
      consulta.andWhere(
        'EXISTS (SELECT 1 FROM plan_alumnos pa WHERE pa.plan_id = plan.id AND pa.alumno_id = :alumnoId)',
        { alumnoId: filtros.alumnoId },
      );
    }
    if (filtros.inicioDesde !== undefined) {
      consulta.andWhere('plan.fechaInicio >= :inicioDesde', { inicioDesde: filtros.inicioDesde });
    }
    if (filtros.inicioHasta !== undefined) {
      consulta.andWhere('plan.fechaInicio <= :inicioHasta', { inicioHasta: filtros.inicioHasta });
    }
    const [filasPagina, total] = await consulta
      .orderBy('plan.fechaInicio', 'DESC')
      .addOrderBy('plan.id', 'ASC')
      .skip((pagina - 1) * tamanio)
      .take(tamanio)
      .getManyAndCount();
    if (filasPagina.length === 0) return { items: [], total };
    const ids = filasPagina.map((fila) => fila.id);
    const completas = await this.repositorio.find({
      where: { id: In(ids) },
      relations: { dias: true, alumnos: true },
    });
    const items = ids
      .map((id) => completas.find((fila) => fila.id === id))
      .filter((fila): fila is PlanEsquema => fila !== undefined)
      .map((fila) => PlanMapper.aDominio(fila));
    return { items, total };
  }
}
