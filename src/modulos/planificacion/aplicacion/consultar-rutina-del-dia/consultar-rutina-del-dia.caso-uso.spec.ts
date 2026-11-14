import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaNombresEjerciciosFalsa,
  ConsultaVinculosFalsa,
  RelojFijo,
  RepositorioPlanesEnMemoria,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import type { DatosDiaPlan } from '../../dominio/plan/plan.entidad.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import type { EjercicioDelCatalogo } from '../../dominio/rutina/ejercicio-del-catalogo.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ConsultarRutinaDelDia } from './consultar-rutina-del-dia.caso-uso.js';

const PRESS_PECHO: EjercicioDelCatalogo = {
  id: 'lever-chest-press',
  porTiempo: false,
  admitePesoExtra: true,
};

/** 2026-11-13: la fecha del vencimiento pesimista de US08. */
const HOY = new Date(Date.UTC(2026, 10, 13));

const dias = (rutinaId: string | null = null): DatosDiaPlan[] =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const conRutinaEnElDia = (numero: number, rutinaId: string): DatosDiaPlan[] =>
  dias().map((dia) => (dia.numero === numero ? { ...dia, rutinaId } : dia));

describe('US08 · consultar la rutina del día', () => {
  let planes: RepositorioPlanesEnMemoria;
  let rutinas: RepositorioRutinasEnMemoria;
  let vinculos: ConsultaVinculosFalsa;
  let nombres: ConsultaNombresEjerciciosFalsa;

  beforeEach(() => {
    planes = new RepositorioPlanesEnMemoria();
    rutinas = new RepositorioRutinasEnMemoria();
    vinculos = new ConsultaVinculosFalsa([], { 'u-alumno': 'a1' });
    nombres = new ConsultaNombresEjerciciosFalsa({ 'lever-chest-press': 'lever chest press' });
  });

  const consultar = (fecha: Date = HOY): ConsultarRutinaDelDia =>
    new ConsultarRutinaDelDia(planes, rutinas, vinculos, nombres, new RelojFijo(fecha));

  const rutinaLlamada = async (nombre: string): Promise<Rutina> => {
    const rutina = Rutina.crear({
      profesorUsuarioId: 'u-diego',
      nombre,
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

  const planDe = async (inicio: string, diasDelPlan: DatosDiaPlan[] = dias()): Promise<Plan> => {
    const plan = Plan.crear({
      profesorUsuarioId: 'u-diego',
      fechaInicio: inicio,
      dias: diasDelPlan,
      alumnoIds: ['a1'],
    });
    await planes.guardar(plan);
    return plan;
  };

  it('con un plan vigente y rutina hoy devuelve la rutina, la fecha y el número de día', async () => {
    const rutina = await rutinaLlamada('Piernas');
    await planDe('2026-11-13', conRutinaEnElDia(1, rutina.id));

    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toMatchObject({
      estado: 'rutina',
      fecha: '2026-11-13',
      numeroDia: 1,
    });
    if (resultado.estado !== 'rutina') throw new Error('Se esperaba una rutina');
    expect(resultado.rutina).toMatchObject({ id: rutina.id, nombre: 'Piernas' });
    expect(resultado.rutina.bloques[0]).toEqual({
      ejercicioId: 'lever-chest-press',
      nombre: 'lever chest press',
      series: 3,
      micropausaSegundos: 60,
      macropausaSegundos: 120,
      repeticiones: 10,
      segundos: null,
      pesoKg: null,
    });
  });

  it('con un plan vigente y un día de descanso informa descanso con su número de día', async () => {
    await planDe('2026-11-13');

    const resultado = await consultar(new Date(Date.UTC(2026, 10, 14))).ejecutar('u-alumno');

    expect(resultado).toEqual({ estado: 'descanso', fecha: '2026-11-14', numeroDia: 2 });
  });

  it('sin ningún plan informa que no hay plan con la fecha de hoy', async () => {
    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toEqual({ estado: 'sin-plan', fecha: '2026-11-13' });
  });

  it('con un plan que terminó ayer informa que no hay plan', async () => {
    await planDe('2026-10-16');

    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toEqual({ estado: 'sin-plan', fecha: '2026-11-13' });
  });

  it('con un plan que empieza mañana informa que no hay plan', async () => {
    await planDe('2026-11-14');

    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toEqual({ estado: 'sin-plan', fecha: '2026-11-13' });
  });

  it('el primer día del plan corresponde a la fecha de inicio', async () => {
    const rutina = await rutinaLlamada('Piernas');
    await planDe('2026-11-13', conRutinaEnElDia(1, rutina.id));

    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toMatchObject({
      estado: 'rutina',
      fecha: '2026-11-13',
      numeroDia: 1,
    });
  });

  it('el último día del plan sigue vigente y corresponde a la fecha de fin', async () => {
    const rutina = await rutinaLlamada('Piernas');
    await planDe('2026-10-17', conRutinaEnElDia(28, rutina.id));

    const resultado = await consultar().ejecutar('u-alumno');

    expect(resultado).toMatchObject({
      estado: 'rutina',
      fecha: '2026-11-13',
      numeroDia: 28,
    });
  });

  it('devuelve la rutina del día consultado y no la de otro día', async () => {
    const primera = await rutinaLlamada('Piernas');
    const cuarta = await rutinaLlamada('Espalda');
    await planDe(
      '2026-11-13',
      dias().map((dia) => {
        if (dia.numero === 1) return { ...dia, rutinaId: primera.id };
        if (dia.numero === 4) return { ...dia, rutinaId: cuarta.id };
        return dia;
      }),
    );

    const resultado = await consultar(new Date(Date.UTC(2026, 10, 16))).ejecutar('u-alumno');

    expect(resultado).toMatchObject({ estado: 'rutina', numeroDia: 4 });
    if (resultado.estado !== 'rutina') throw new Error('Se esperaba una rutina');
    expect(resultado.rutina.id).toBe(cuarta.id);
  });

  it('con un usuario sin ficha de alumno informa que no hay plan', async () => {
    const resultado = await consultar().ejecutar('u-sin-ficha');

    expect(resultado).toEqual({ estado: 'sin-plan', fecha: '2026-11-13' });
  });
});
