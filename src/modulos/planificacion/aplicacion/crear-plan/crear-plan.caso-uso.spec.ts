import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  ConsultaVinculosFalsa,
  RelojFijo,
  RepositorioPlanesEnMemoria,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { PublicadorEventosFalso } from '../../../../../test/dobles/identidad.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { EjercicioDelCatalogo } from '../../dominio/rutina/ejercicio-del-catalogo.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { type PedidoPlan, CrearPlan } from './crear-plan.caso-uso.js';

const PRESS_PECHO: EjercicioDelCatalogo = {
  id: 'lever-chest-press',
  porTiempo: false,
  admitePesoExtra: true,
};

const HOY = new Date(Date.UTC(2026, 10, 13));

const dias = (rutinaId: string | null = null) =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const conRutinaEnElPrimerDia = (rutinaId: string) =>
  dias().map((dia) => (dia.numero === 1 ? { ...dia, rutinaId } : dia));

const pedido = (cambios: Partial<PedidoPlan> = {}): PedidoPlan => ({
  fechaInicio: '2026-11-13',
  dias: dias(),
  alumnos: ['a1'],
  ...cambios,
});

const errorDe = async (accion: Promise<unknown>): Promise<ErrorDominio | undefined> => {
  try {
    await accion;
  } catch (error) {
    if (error instanceof ErrorDominio) return error;
    throw error;
  }
  return undefined;
};

describe('US07 · crear un plan de 28 días', () => {
  let planes: RepositorioPlanesEnMemoria;
  let rutinas: RepositorioRutinasEnMemoria;
  let publicador: PublicadorEventosFalso;
  let crearPlan: CrearPlan;

  beforeEach(() => {
    planes = new RepositorioPlanesEnMemoria();
    rutinas = new RepositorioRutinasEnMemoria();
    publicador = new PublicadorEventosFalso();
    crearPlan = new CrearPlan(
      planes,
      rutinas,
      new ConsultaVinculosFalsa([{ alumnoId: 'a1', profesorUsuarioId: 'u-laura' }]),
      new RelojFijo(HOY),
      publicador,
    );
  });

  const rutinaDe = async (profesorUsuarioId: string): Promise<Rutina> => {
    const rutina = Rutina.crear({
      profesorUsuarioId,
      bloques: [
        {
          ejercicio: PRESS_PECHO,
          series: 3,
          micropausaSegundos: 60,
          macropausaSegundos: 120,
          repeticiones: 10,
        },
      ],
    });
    await rutinas.guardar(rutina);
    return rutina;
  };

  const planVigenteDe = async (inicio: string): Promise<Plan> => {
    const plan = Plan.crear({
      profesorUsuarioId: 'u-diego',
      fechaInicio: inicio,
      dias: dias(),
      alumnoIds: ['a1'],
    });
    await planes.guardar(plan);
    return plan;
  };

  it('con un alumno vinculado y una rutina propia guarda el plan y publica PlanCreado', async () => {
    const rutina = await rutinaDe('u-laura');

    const plan = await crearPlan.ejecutar(
      'u-laura',
      pedido({ dias: conRutinaEnElPrimerDia(rutina.id) }),
    );

    expect([plan.fechaInicio, plan.fechaFin, plan.alumnoIds]).toEqual([
      '2026-11-13',
      '2026-12-10',
      ['a1'],
    ]);
    expect(planes.planes).toEqual([plan]);
    expect(publicador.eventos.map((evento) => evento.nombre)).toEqual(['PlanCreado']);
  });

  it('con un alumno no vinculado al profesor se rechaza con RN-PLAN-13', async () => {
    const error = await errorDe(crearPlan.ejecutar('u-laura', pedido({ alumnos: ['a1', 'a2'] })));

    expect([error?.codigo, error?.categoria]).toEqual(['RN-PLAN-13', 'validacion']);
  });

  it('con una rutina que no existe se rechaza con RN-PLAN-08 (no encontrado)', async () => {
    const error = await errorDe(
      crearPlan.ejecutar('u-laura', pedido({ dias: conRutinaEnElPrimerDia(randomUUID()) })),
    );

    expect([error?.codigo, error?.categoria]).toEqual(['RN-PLAN-08', 'no-encontrado']);
  });

  it('con una rutina de otro profesor se rechaza con RN-PLAN-08 (no encontrado)', async () => {
    const rutinaAjena = await rutinaDe('u-diego');

    const error = await errorDe(
      crearPlan.ejecutar('u-laura', pedido({ dias: dias(rutinaAjena.id) })),
    );

    expect([error?.codigo, error?.categoria]).toEqual(['RN-PLAN-08', 'no-encontrado']);
  });

  it('con un alumno que ya tiene un plan vigente se rechaza con RN-PLAN-14 (conflicto)', async () => {
    await planVigenteDe('2026-11-01');

    const error = await errorDe(crearPlan.ejecutar('u-laura', pedido()));

    expect([error?.codigo, error?.categoria]).toEqual(['RN-PLAN-14', 'conflicto']);
  });

  it('con un alumno cuyo plan ya terminó, el plan nuevo se crea', async () => {
    await planVigenteDe('2026-10-01');

    const plan = await crearPlan.ejecutar('u-laura', pedido());

    expect(planes.planes).toHaveLength(2);
    expect(plan.fechaFin).toBe('2026-12-10');
  });
});
