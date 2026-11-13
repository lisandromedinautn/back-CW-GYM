import { randomUUID } from 'node:crypto';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { DiaPlanEsquema, PlanAlumnoEsquema, PlanEsquema } from './plan.esquema.js';

export const PlanMapper = {
  aEsquema(plan: Plan): PlanEsquema {
    return Object.assign(new PlanEsquema(), {
      id: plan.id,
      profesorUsuarioId: plan.profesorUsuarioId,
      fechaInicio: plan.fechaInicio,
      fechaFin: plan.fechaFin,
      dias: plan.dias.map((dia) =>
        Object.assign(new DiaPlanEsquema(), {
          id: randomUUID(),
          planId: plan.id,
          numero: dia.numero,
          fecha: dia.fecha,
          rutinaId: dia.rutinaId,
        }),
      ),
      alumnos: plan.alumnoIds.map((alumnoId) =>
        Object.assign(new PlanAlumnoEsquema(), { planId: plan.id, alumnoId }),
      ),
    });
  },

  aDominio(fila: PlanEsquema): Plan {
    return Plan.reconstruir({
      id: fila.id,
      profesorUsuarioId: fila.profesorUsuarioId,
      fechaInicio: fila.fechaInicio,
      fechaFin: fila.fechaFin,
      dias: fila.dias.map((dia) => ({ numero: dia.numero, rutinaId: dia.rutinaId })),
      alumnoIds: fila.alumnos.map((alumno) => alumno.alumnoId),
    });
  },
};
