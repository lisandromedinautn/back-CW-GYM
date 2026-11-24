import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaEntrenamientosIniciados } from '../../dominio/plan/consulta-entrenamientos-iniciados.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';

export interface DiaEditado {
  numero: number;
  fecha: string;
  rutinaId: string | null;
  esDescanso: boolean;
}

/**
 * US22. RN-PLAN-23: el profesor cambia la rutina de un día de su plan. Solo planes propios y
 * rutinas propias (RN-PLAN-08); hoy no se edita si un alumno del plan ya inició su Entrenamiento.
 */
export class EditarDiaPlan {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly rutinas: RepositorioRutinas,
    private readonly entrenamientos: ConsultaEntrenamientosIniciados,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(
    profesorUsuarioId: string,
    planId: string,
    numero: number,
    rutinaId: string | null,
  ): Promise<DiaEditado> {
    const plan = await this.planes.buscarPorId(planId);
    if (!plan || plan.profesorUsuarioId !== profesorUsuarioId)
      throw new ErrorDominio('RN-PLAN-23', 'El plan no existe o no es tuyo', 'no-encontrado');
    if (rutinaId !== null) {
      const rutina = await this.rutinas.buscarPorId(rutinaId);
      if (!rutina || rutina.profesorUsuarioId !== profesorUsuarioId)
        throw new ErrorDominio('RN-PLAN-23', 'La rutina no existe o no es tuya', 'no-encontrado');
    }

    const hoy = fechaIso(this.reloj.ahora());
    // El día de hoy se verifica antes de mutar el plan: si hay conflicto no queda nada cambiado.
    if (
      plan.diaPorFecha(hoy)?.numero === numero &&
      (await this.entrenamientos.hayIniciadoEn([...plan.alumnoIds], hoy))
    )
      throw new ErrorDominio(
        'RN-PLAN-23',
        'Un alumno del plan ya inició el entrenamiento de hoy',
        'conflicto',
      );

    plan.editarDia(numero, rutinaId, hoy);
    const dia = plan.dias.find((candidato) => candidato.numero === numero);
    if (!dia) throw new ErrorDominio('RN-PLAN-11', `El día ${numero} no existe en el plan`);
    await this.planes.guardar(plan);
    return {
      numero: dia.numero,
      fecha: dia.fecha,
      rutinaId: dia.rutinaId,
      esDescanso: dia.esDescanso,
    };
  }
}
