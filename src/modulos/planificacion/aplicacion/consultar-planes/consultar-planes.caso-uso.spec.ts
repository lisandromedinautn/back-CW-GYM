import { beforeEach, describe, expect, it } from 'vitest';
import { RelojFijo, RepositorioPlanesEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { type ConsultaPlanes, ConsultarPlanes } from './consultar-planes.caso-uso.js';

const relojEl = (fecha: string) => new RelojFijo(new Date(`${fecha}T00:00:00Z`));

const dias = (cantidadConRutina = 0) =>
  Array.from({ length: 28 }, (_, indice) => ({
    numero: indice + 1,
    rutinaId: indice < cantidadConRutina ? `rutina-${indice + 1}` : null,
  }));

describe('RN-PLAN-22 · un profesor solo consulta sus propios planes', () => {
  let planes: RepositorioPlanesEnMemoria;
  let consultarPlanes: ConsultarPlanes;

  const guardarPlan = async (
    profesorUsuarioId: string,
    fechaInicio: string,
    alumnoIds: string[] = ['a1'],
    cantidadConRutina = 0,
  ): Promise<Plan> => {
    const plan = Plan.crear({
      profesorUsuarioId,
      fechaInicio,
      dias: dias(cantidadConRutina),
      alumnoIds,
    });
    await planes.guardar(plan);
    return plan;
  };

  beforeEach(() => {
    planes = new RepositorioPlanesEnMemoria();
    consultarPlanes = new ConsultarPlanes(planes, relojEl('2026-11-21'));
  });

  it('solo devuelve los planes del profesor: el de otro profesor no aparece', async () => {
    const planPropio = await guardarPlan('u-laura', '2026-11-01');
    await guardarPlan('u-diego', '2026-11-01');

    const resultado = await consultarPlanes.ejecutar('u-laura');

    expect({
      total: resultado.total,
      ids: resultado.items.map((plan) => plan.id),
    }).toEqual({ total: 1, ids: [planPropio.id] });
  });

  it('filtra por estado: con estado vigente solo devuelve el plan vigente', async () => {
    await guardarPlan('u-laura', '2026-10-01');
    await guardarPlan('u-laura', '2026-11-01');
    await guardarPlan('u-laura', '2026-12-01');

    const resultado = await consultarPlanes.ejecutar('u-laura', { estado: 'vigente' });

    expect(resultado.items.map((plan) => [plan.fechaInicio, plan.estado])).toEqual([
      ['2026-11-01', 'vigente'],
    ]);
  });

  it('filtra por alumno: solo devuelve los planes que incluyen a ese alumno', async () => {
    await guardarPlan('u-laura', '2026-11-01', ['a1']);
    await guardarPlan('u-laura', '2026-10-01', ['a2']);

    const resultado = await consultarPlanes.ejecutar('u-laura', { alumnoId: 'a1' });

    expect(resultado.items.map((plan) => plan.alumnoIds)).toEqual([['a1']]);
  });

  it('filtra por rango de fecha de inicio con ambos extremos incluidos', async () => {
    await guardarPlan('u-laura', '2026-10-31');
    await guardarPlan('u-laura', '2026-11-01');
    await guardarPlan('u-laura', '2026-11-15');
    await guardarPlan('u-laura', '2026-11-16');

    const resultado = await consultarPlanes.ejecutar('u-laura', {
      inicioDesde: '2026-11-01',
      inicioHasta: '2026-11-15',
    });

    expect(resultado.items.map((plan) => plan.fechaInicio)).toEqual(['2026-11-15', '2026-11-01']);
  });

  it('los filtros se combinan: estado, alumno y rango de fechas a la vez', async () => {
    const planCoincidente = await guardarPlan('u-laura', '2026-11-01', ['a1']);
    await guardarPlan('u-laura', '2026-11-01', ['a2']);
    await guardarPlan('u-laura', '2026-10-01', ['a1']);
    await guardarPlan('u-laura', '2026-11-20', ['a1']);

    const consulta: ConsultaPlanes = {
      estado: 'vigente',
      alumnoId: 'a1',
      inicioDesde: '2026-10-15',
      inicioHasta: '2026-11-15',
    };
    const resultado = await consultarPlanes.ejecutar('u-laura', consulta);

    expect(resultado.items.map((plan) => plan.id)).toEqual([planCoincidente.id]);
  });

  it('ordena por fecha de inicio, del más nuevo al más viejo', async () => {
    await guardarPlan('u-laura', '2026-10-01');
    await guardarPlan('u-laura', '2026-12-01');
    await guardarPlan('u-laura', '2026-11-01');

    const resultado = await consultarPlanes.ejecutar('u-laura');

    expect(resultado.items.map((plan) => plan.fechaInicio)).toEqual([
      '2026-12-01',
      '2026-11-01',
      '2026-10-01',
    ]);
  });

  it('pagina: devuelve el total y solo los ítems de la página pedida', async () => {
    await guardarPlan('u-laura', '2026-11-01');
    await guardarPlan('u-laura', '2026-11-02');
    await guardarPlan('u-laura', '2026-11-03');
    await guardarPlan('u-laura', '2026-11-04');
    await guardarPlan('u-laura', '2026-11-05');
    await guardarPlan('u-laura', '2026-11-06');
    await guardarPlan('u-laura', '2026-11-07');

    const resultado = await consultarPlanes.ejecutar('u-laura', { pagina: 2, tamanio: 5 });

    expect({
      total: resultado.total,
      fechas: resultado.items.map((plan) => plan.fechaInicio),
    }).toEqual({ total: 7, fechas: ['2026-11-02', '2026-11-01'] });
  });
});

describe('RN-PLAN-15 · el estado del plan sale de la fecha del reloj', () => {
  it('con el reloj en 31/10 es proximo; 01/11 y 28/11 vigente; 29/11 finalizado', async () => {
    const planes = new RepositorioPlanesEnMemoria();
    await planes.guardar(
      Plan.crear({
        profesorUsuarioId: 'u-laura',
        fechaInicio: '2026-11-01',
        dias: dias(),
        alumnoIds: ['a1'],
      }),
    );

    const estadoEl = async (fecha: string) =>
      (await new ConsultarPlanes(planes, relojEl(fecha)).ejecutar('u-laura')).items[0].estado;

    expect([
      await estadoEl('2026-10-31'),
      await estadoEl('2026-11-01'),
      await estadoEl('2026-11-28'),
      await estadoEl('2026-11-29'),
    ]).toEqual(['proximo', 'vigente', 'vigente', 'finalizado']);
  });
});

describe('RN-PLAN-10 · cada día tiene rutina o es de descanso', () => {
  it('un plan con 20 días con rutina informa 20 días con rutina y 8 de descanso', async () => {
    const planes = new RepositorioPlanesEnMemoria();
    await planes.guardar(
      Plan.crear({
        profesorUsuarioId: 'u-laura',
        fechaInicio: '2026-11-01',
        dias: dias(20),
        alumnoIds: ['a1'],
      }),
    );

    const [resumen] = (await new ConsultarPlanes(planes, relojEl('2026-11-21')).ejecutar('u-laura'))
      .items;

    expect({
      diasConRutina: resumen.diasConRutina,
      diasDeDescanso: resumen.diasDeDescanso,
    }).toEqual({ diasConRutina: 20, diasDeDescanso: 8 });
  });
});
