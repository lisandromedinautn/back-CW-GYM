import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  type FiltrosPlanes,
  RepositorioPlanes,
} from '../../dominio/plan/repositorio-planes.puerto.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import { PlanAlumnoEsquema, PlanEsquema } from './plan.esquema.js';
import { PlanMapper } from './plan.mapper.js';

@Injectable()
export class RepositorioPlanesTypeorm extends RepositorioPlanes {
  constructor(
    @InjectRepository(PlanEsquema) private readonly repositorio: Repository<PlanEsquema>,
  ) {
    super();
  }

  async guardar(plan: Plan, fechaActual?: string): Promise<void> {
    if (!fechaActual) {
      await this.repositorio.save(PlanMapper.aEsquema(plan));
      return;
    }
    await this.repositorio.manager.transaction(async (manager) => {
      for (const alumnoId of [...plan.alumnoIds].sort()) {
        await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [alumnoId]);
        const conflictos = await manager.query(
          'SELECT 1 FROM plan_alumnos a JOIN planes p ON p.id = a.plan_id WHERE a.alumno_id = $1 AND p.fecha_inicio <= $2 AND p.fecha_fin >= $2 LIMIT 1',
          [alumnoId, fechaActual],
        );
        if (conflictos.length)
          throw new ErrorDominio('RN-PLAN-14', 'El alumno ya tiene un plan vigente', 'conflicto');
      }
      await manager.getRepository(PlanEsquema).save(PlanMapper.aEsquema(plan));
    });
  }

  async buscarPorId(id: string): Promise<Plan | null> {
    const fila = await this.repositorio.findOne({
      where: { id },
      relations: { dias: true, alumnos: true },
    });
    return fila ? PlanMapper.aDominio(fila) : null;
  }

  async agregarAlumno(planId: string, alumnoId: string, fechaActual: string): Promise<void> {
    await this.repositorio.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [alumnoId]);
      const conflictos = await manager.query(
        'SELECT 1 FROM plan_alumnos a JOIN planes p ON p.id = a.plan_id WHERE a.alumno_id = $1 AND p.id <> $2 AND p.fecha_inicio <= $3 AND p.fecha_fin >= $3 LIMIT 1',
        [alumnoId, planId, fechaActual],
      );
      if (conflictos.length)
        throw new ErrorDominio('RN-PLAN-14', 'El alumno ya tiene un plan vigente', 'conflicto');
      await manager
        .createQueryBuilder()
        .insert()
        .into(PlanAlumnoEsquema)
        .values({ planId, alumnoId })
        .orIgnore()
        .execute();
    });
  }

  async quitarAlumno(planId: string, alumnoId: string): Promise<void> {
    await this.repositorio.manager.getRepository(PlanAlumnoEsquema).delete({ planId, alumnoId });
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
