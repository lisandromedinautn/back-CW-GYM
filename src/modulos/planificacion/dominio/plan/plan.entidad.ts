import { randomUUID } from 'node:crypto';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { DiaPlan } from './dia-plan.entidad.js';
import { DIAS_DEL_PLAN, ValidezPlan } from './validez-plan.valor.js';

/** Un día tal como llega del profesor: `rutinaId` null significa descanso (RN-PLAN-10). */
export interface DatosDiaPlan {
  numero: number;
  rutinaId: string | null;
}

export interface DatosPlan {
  profesorUsuarioId: string;
  fechaInicio: string;
  dias: DatosDiaPlan[];
  alumnoIds: string[];
}

export interface DatosPlanReconstruido extends DatosPlan {
  id: string;
  fechaFin: string;
}

/**
 * Agregado Plan de Entrenamiento. RN-PLAN-09: 28 días y fecha de fin calculada. RN-PLAN-10:
 * cada día tiene una rutina o es de descanso. RN-PLAN-11: la fecha de cada día sale del inicio.
 * RN-PLAN-12: se crea con al menos un alumno. RN-PLAN-17: no hay finalización anticipada; el
 * plan deja de estar vigente solo cuando pasa su fecha de fin (RN-PLAN-15).
 */
export class Plan {
  private constructor(
    readonly id: string,
    readonly profesorUsuarioId: string,
    readonly validez: ValidezPlan,
    readonly dias: readonly DiaPlan[],
    readonly alumnoIds: readonly string[],
  ) {}

  get fechaInicio(): string {
    return this.validez.inicio;
  }

  get fechaFin(): string {
    return this.validez.fin;
  }

  /** RN-PLAN-15. */
  estaVigente(fecha: Date): boolean {
    return this.validez.estaVigente(fecha);
  }

  /** RN-PLAN-09, 10, 11 y 12. */
  static crear(datos: DatosPlan): Plan {
    const validez = ValidezPlan.crear(datos.fechaInicio);
    if (datos.dias.length !== DIAS_DEL_PLAN) {
      throw new ErrorDominio('RN-PLAN-09', `El plan tiene que tener ${DIAS_DEL_PLAN} días`);
    }

    const numeros = new Set<number>();
    for (const dia of datos.dias) {
      if (!Number.isInteger(dia.numero) || dia.numero < 1 || dia.numero > DIAS_DEL_PLAN) {
        throw new ErrorDominio(
          'RN-PLAN-11',
          `El día ${dia.numero} no corresponde a un plan de ${DIAS_DEL_PLAN} días`,
        );
      }
      if (numeros.has(dia.numero)) {
        throw new ErrorDominio('RN-PLAN-11', `El día ${dia.numero} está repetido`);
      }
      numeros.add(dia.numero);
    }

    // RN-PLAN-12: el plan se crea con uno o más alumnos.
    if (datos.alumnoIds.length === 0) {
      throw new ErrorDominio('RN-PLAN-12', 'El plan se crea con al menos un alumno');
    }

    const dias = [...datos.dias]
      .sort((uno, otro) => uno.numero - otro.numero)
      .map((dia) =>
        DiaPlan.crear(dia.numero, validez.fechaDelDia(dia.numero), dia.rutinaId ?? null),
      );

    return new Plan(randomUUID(), datos.profesorUsuarioId, validez, dias, [
      ...new Set(datos.alumnoIds),
    ]);
  }

  /** Rehidrata desde la base sin volver a validar las invariantes. */
  static reconstruir(datos: DatosPlanReconstruido): Plan {
    const validez = ValidezPlan.reconstruir(datos.fechaInicio, datos.fechaFin);
    return new Plan(
      datos.id,
      datos.profesorUsuarioId,
      validez,
      datos.dias.map((dia) =>
        DiaPlan.crear(dia.numero, validez.fechaDelDia(dia.numero), dia.rutinaId),
      ),
      datos.alumnoIds,
    );
  }
}
