import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import { PlanCreado } from '../../dominio/plan/plan-creado.evento.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import type { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';

/** Un día del plan: la rutina asignada o null para descanso (RN-PLAN-10). */
export interface PedidoDiaPlan {
  numero: number;
  rutinaId: string | null;
}

/** US07: el profesor crea un plan de 28 días para uno o más alumnos. */
export interface PedidoPlan {
  fechaInicio: string;
  dias: PedidoDiaPlan[];
  alumnos: string[];
}

/**
 * US07. Crea el plan con sus 28 días y sus alumnos. RN-PLAN-13 y 14 cruzan agregados, así que
 * las valida este caso de uso con la Fachada de identidad y el repositorio de planes.
 */
export class CrearPlan {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly rutinas: RepositorioRutinas,
    private readonly vinculos: ConsultaVinculos,
    private readonly reloj: Reloj,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(profesorUsuarioId: string, pedido: PedidoPlan): Promise<Plan> {
    // Primero las invariantes del agregado (RN-PLAN-09, 10, 11 y 12).
    const plan = Plan.crear({
      profesorUsuarioId,
      fechaInicio: pedido.fechaInicio,
      dias: pedido.dias,
      alumnoIds: pedido.alumnos,
    });

    await this.validarAlumnosVinculados(profesorUsuarioId, plan.alumnoIds);
    await this.validarRutinasPropias(profesorUsuarioId, plan);
    await this.validarAlumnosSinPlanVigente(plan.alumnoIds);

    await this.planes.guardar(plan);
    await this.publicador.publicar(new PlanCreado(plan.id, profesorUsuarioId, plan.alumnoIds));
    return plan;
  }

  /** RN-PLAN-13: solo se asignan alumnos vinculados al profesor del plan. */
  private async validarAlumnosVinculados(
    profesorUsuarioId: string,
    alumnoIds: readonly string[],
  ): Promise<void> {
    for (const alumnoId of alumnoIds) {
      if (!(await this.vinculos.alumnoVinculadoAProfesor(alumnoId, profesorUsuarioId))) {
        throw new ErrorDominio(
          'RN-PLAN-13',
          'Solo podés asignar alumnos vinculados a vos',
          'validacion',
        );
      }
    }
  }

  /**
   * RN-PLAN-08: las rutinas de los días tienen que existir y ser del profesor que crea el plan.
   */
  private async validarRutinasPropias(profesorUsuarioId: string, plan: Plan): Promise<void> {
    const rutinaIds = new Set(
      plan.dias
        .map((dia) => dia.rutinaId)
        .filter((rutinaId): rutinaId is string => rutinaId !== null),
    );
    for (const rutinaId of rutinaIds) {
      const rutina = await this.rutinas.buscarPorId(rutinaId);
      if (!rutina || rutina.profesorUsuarioId !== profesorUsuarioId) {
        throw new ErrorDominio('RN-PLAN-08', 'La rutina no existe o no es tuya', 'no-encontrado');
      }
    }
  }

  /** RN-PLAN-14: un alumno tiene como máximo un plan vigente (RN-PLAN-15). */
  private async validarAlumnosSinPlanVigente(alumnoIds: readonly string[]): Promise<void> {
    const hoy = fechaIso(this.reloj.ahora());
    for (const alumnoId of alumnoIds) {
      const vigentes = await this.planes.listarVigentesPorAlumno(alumnoId, hoy);
      if (vigentes.length > 0) {
        throw new ErrorDominio('RN-PLAN-14', 'El alumno ya tiene un plan vigente', 'conflicto');
      }
    }
  }
}
