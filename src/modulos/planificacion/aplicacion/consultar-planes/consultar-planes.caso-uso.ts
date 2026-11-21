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

  private resumir(plan: Plan, ahora: Date): ResumenPlan {
    const validez = ValidezPlan.reconstruir(plan.fechaInicio, plan.fechaFin);
    const hoy = fechaIso(ahora);
    let estado: EstadoPlan = 'vigente';
    if (!validez.estaVigente(ahora)) estado = hoy < plan.fechaInicio ? 'proximo' : 'finalizado';
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
