import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';

export class AlumnosDelPlan {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly vinculos: ConsultaVinculos,
    private readonly reloj: Reloj,
  ) {}

  async consultar(profesorId: string, planId: string): Promise<Plan> {
    const plan = await this.planes.buscarPorId(planId);
    if (!plan || plan.profesorUsuarioId !== profesorId)
      throw new ErrorDominio('RN-PLAN-16', 'El plan no existe o no es tuyo', 'no-encontrado');
    if (!plan.estaVigente(this.reloj.ahora()))
      throw new ErrorDominio(
        'RN-PLAN-16',
        'Solo podés modificar alumnos de un plan vigente',
        'conflicto',
      );
    return plan;
  }

  async agregar(profesorId: string, planId: string, alumnoId: string): Promise<void> {
    const plan = await this.consultar(profesorId, planId);
    if (plan.alumnoIds.includes(alumnoId)) return;
    if (!(await this.vinculos.alumnoVinculadoAProfesor(alumnoId, profesorId)))
      throw new ErrorDominio('RN-PLAN-13', 'Solo podés asignar alumnos vinculados a vos');
    if (
      (await this.planes.listarVigentesPorAlumno(alumnoId, fechaIso(this.reloj.ahora()))).length > 0
    )
      throw new ErrorDominio('RN-PLAN-14', 'El alumno ya tiene un plan vigente', 'conflicto');
    await this.planes.agregarAlumno(planId, alumnoId, fechaIso(this.reloj.ahora()));
  }

  async quitar(profesorId: string, planId: string, alumnoId: string): Promise<void> {
    const plan = await this.consultar(profesorId, planId);
    if (plan.alumnoIds.includes(alumnoId)) await this.planes.quitarAlumno(planId, alumnoId);
  }
}
