import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import { ValidezPlan } from '../../dominio/plan/validez-plan.valor.js';

export type EstadoPlan = 'proximo' | 'vigente' | 'finalizado';

export interface ConsultaPlanes {
  pagina?: number;
  tamanio?: number;
  estado?: EstadoPlan;
  alumnoId?: string;
  inicioDesde?: string;
  inicioHasta?: string;
}

export interface ResumenPlan {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPlan;
  alumnoIds: string[];
  diasConRutina: number;
  diasDeDescanso: number;
}

export interface DetallePlan {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPlan;
  dias: { numero: number; fecha: string; rutinaId: string | null; esDescanso: boolean }[];
}

/**
 * T13: listado paginado de los planes del profesor.
 * RN-PLAN-22: solo sus planes, filtros y orden los resuelve el repositorio. RN-PLAN-15: el estado
 * sale de la fecha UTC del `Reloj`. La validación de la entrada es del DTO.
 */
export class ConsultarPlanes {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(
    profesorUsuarioId: string,
    consulta: ConsultaPlanes = {},
  ): Promise<Pagina<ResumenPlan>> {
    const { pagina = 1, tamanio = 10, ...filtros } = consulta;
    const ahora = this.reloj.ahora();
    const { items, total } = await this.planes.listarPorProfesor(
      profesorUsuarioId,
      { ...filtros, hoy: fechaIso(ahora) },
      pagina,
      tamanio,
    );
    return { items: items.map((plan) => this.resumir(plan, ahora)), total, pagina, tamanio };
  }

  /** US22: detalle de un plan propio con sus 28 días. Ajeno o inexistente: no encontrado. */
  async porId(profesorUsuarioId: string, planId: string): Promise<DetallePlan> {
    const plan = await this.planes.buscarPorId(planId);
    if (!plan || plan.profesorUsuarioId !== profesorUsuarioId)
      throw new ErrorDominio('RN-PLAN-22', 'El plan no existe o no es tuyo', 'no-encontrado');
    return {
      id: plan.id,
      fechaInicio: plan.fechaInicio,
      fechaFin: plan.fechaFin,
      estado: this.estadoDe(plan, this.reloj.ahora()),
      dias: plan.dias.map((dia) => ({
        numero: dia.numero,
        fecha: dia.fecha,
        rutinaId: dia.rutinaId,
        esDescanso: dia.esDescanso,
      })),
    };
  }

  private estadoDe(plan: Plan, ahora: Date): EstadoPlan {
    const validez = ValidezPlan.reconstruir(plan.fechaInicio, plan.fechaFin);
    if (validez.estaVigente(ahora)) return 'vigente';
    return fechaIso(ahora) < plan.fechaInicio ? 'proximo' : 'finalizado';
  }

  private resumir(plan: Plan, ahora: Date): ResumenPlan {
    const estado = this.estadoDe(plan, ahora);
    const diasDeDescanso = plan.dias.filter((dia) => dia.esDescanso).length;
    return {
      id: plan.id,
      fechaInicio: plan.fechaInicio,
      fechaFin: plan.fechaFin,
      estado,
      alumnoIds: [...plan.alumnoIds],
      diasConRutina: plan.dias.length - diasDeDescanso,
      diasDeDescanso,
    };
  }
}
