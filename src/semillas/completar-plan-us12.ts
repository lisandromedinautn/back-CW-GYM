import { DataSource, In } from 'typeorm';
import { EjercicioEsquema } from '../modulos/catalogo/infraestructura/ejercicio/ejercicio.esquema.js';
import { fechaIso } from '../modulos/planificacion/dominio/plan/fechas.js';
import { Rutina } from '../modulos/planificacion/dominio/rutina/rutina.entidad.js';
import {
  DiaPlanEsquema,
  PlanEsquema,
} from '../modulos/planificacion/infraestructura/plan/plan.esquema.js';
import { RutinaEsquema } from '../modulos/planificacion/infraestructura/rutina/rutina.esquema.js';
import { RutinaMapper } from '../modulos/planificacion/infraestructura/rutina/rutina.mapper.js';

const PLAN_ID = '12000000-0000-4000-8000-000000000101';
const PROFESOR_ID = '12000000-0000-4000-8000-000000000001';
const ALUMNO_ID = '12000000-0000-4000-8000-000000000301';
const RUTINA_ID = '12000000-0000-4000-8000-000000000401';

/** Completa una sola vez el plan de prueba, sin reemplazar rutinas existentes. */
export class CompletarPlanUS12 {
  constructor(
    private readonly base: DataSource,
    private readonly fecha: Date,
  ) {}

  async ejecutar(): Promise<void> {
    await this.base.transaction(async (manager) => {
      const plan = await manager.findOne(PlanEsquema, {
        where: { id: PLAN_ID },
        relations: { dias: true, alumnos: true },
      });
      const hoy = fechaIso(this.fecha);
      if (
        !plan ||
        plan.profesorUsuarioId !== PROFESOR_ID ||
        hoy < plan.fechaInicio ||
        hoy > plan.fechaFin ||
        !plan.alumnos.some((alumno) => alumno.alumnoId === ALUMNO_ID) ||
        plan.dias.length !== 28
      ) {
        throw new Error(
          'El alumno no tiene el plan de prueba vigente con 28 días; no se modificó ningún dato',
        );
      }
      const rutinaExistente = await manager.findOne(RutinaEsquema, {
        where: [
          { id: RUTINA_ID },
          { profesorUsuarioId: PROFESOR_ID, nombre: 'Ejercicios de prueba US12' },
        ],
      });
      if (
        plan.dias.every((dia) => dia.rutinaId === RUTINA_ID) &&
        rutinaExistente?.id === RUTINA_ID &&
        rutinaExistente.profesorUsuarioId === PROFESOR_ID
      )
        return;
      if (plan.dias.some((dia) => dia.rutinaId !== null) || rutinaExistente)
        throw new Error(
          'El plan o la rutina de prueba ya fueron modificados; no se modificó ningún dato',
        );
      const ejercicios = await manager.find(EjercicioEsquema, {
        where: { idDataset: In(['0001', '0535']) },
        order: { idDataset: 'ASC' },
      });
      if (ejercicios.length !== 2)
        throw new Error(
          'Faltan ejercicios del catálogo; ejecutá yarn seed antes de completar el plan',
        );
      const temporal = Rutina.crear({
        profesorUsuarioId: PROFESOR_ID,
        nombre: 'Ejercicios de prueba US12',
        bloques: ejercicios.map((ejercicio) => ({
          ejercicio: {
            id: ejercicio.id,
            porTiempo: ejercicio.tipo === 'por tiempo',
            admitePesoExtra: ['Peso Extra', 'Peso Corporal + Peso Extra'].includes(
              ejercicio.tipoCarga,
            ),
          },
          series: 3,
          micropausaSegundos: 60,
          macropausaSegundos: 90,
          ...(ejercicio.tipo === 'por tiempo' ? { segundos: 30 } : { repeticiones: 10 }),
        })),
      });
      const rutina = Rutina.reconstruir(
        RUTINA_ID,
        PROFESOR_ID,
        [...temporal.bloques],
        [],
        temporal.nombre,
      );
      await manager.save(RutinaEsquema, RutinaMapper.aEsquema(rutina));
      await manager.update(DiaPlanEsquema, { planId: PLAN_ID }, { rutinaId: RUTINA_ID });
    });
  }
}
