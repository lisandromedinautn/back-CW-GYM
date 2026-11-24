import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaEjerciciosFalsa,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Bloque } from '../../dominio/rutina/bloque.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { EditarRutina } from './editar-rutina.caso-uso.js';

// Casos confirmados por Martina el 24/11/2026 (US06, edición).
const PRESS = { id: 'lever-chest-press', porTiempo: false, admitePesoExtra: true };
const PLANCHA = { id: 'weighted-front-plank', porTiempo: true, admitePesoExtra: true };

let rutinas: RepositorioRutinasEnMemoria;
let editarRutina: EditarRutina;

// Se guarda sin pasar por crear-rutina: la semilla no depende de la regla que se prueba.
const guardarRutina = (profesorUsuarioId: string, nombre: string): string => {
  const id = randomUUID();
  const bloque = Bloque.reconstruir(randomUUID(), {
    ejercicioId: PRESS.id,
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 90,
    repeticiones: 10,
    segundos: null,
    pesoKg: null,
  });
  rutinas.guardar(Rutina.reconstruir(id, profesorUsuarioId, [bloque], [], nombre));
  return id;
};

const codigoDe = (error: unknown) =>
  error instanceof ErrorDominio ? [error.codigo, error.categoria] : error;

beforeEach(() => {
  rutinas = new RepositorioRutinasEnMemoria();
  editarRutina = new EditarRutina(rutinas, new ConsultaEjerciciosFalsa([PRESS, PLANCHA]));
});

describe('RN-PLAN-07 · una rutina se puede editar siempre', () => {
  it('1 bloque de 3x10 pasa a 2 bloques (4x8 y 3x30 s) con el mismo id', async () => {
    const id = guardarRutina('u-laura', 'Pecho');

    await editarRutina.ejecutar('u-laura', id, {
      bloques: [
        {
          ejercicioId: PRESS.id,
          series: 4,
          micropausaSegundos: 60,
          macropausaSegundos: 90,
          repeticiones: 8,
        },
        {
          ejercicioId: PLANCHA.id,
          series: 3,
          micropausaSegundos: 30,
          macropausaSegundos: 60,
          segundos: 30,
        },
      ],
    });

    const guardada = await rutinas.buscarPorId(id);
    expect({
      cantidad: rutinas.rutinas.length,
      nombre: guardada?.nombre,
      bloques: guardada?.bloques.map((b) => [
        b.ejercicio.ejercicioId,
        b.series,
        b.ejercicio.objetivo.repeticiones,
        b.ejercicio.objetivo.segundos,
      ]),
    }).toEqual({
      cantidad: 1,
      nombre: 'Pecho',
      bloques: [
        ['lever-chest-press', 4, 8, null],
        ['weighted-front-plank', 3, null, 30],
      ],
    });
  });
});

describe('RN-PLAN-08 · un profesor solo edita sus propias rutinas', () => {
  const pedido = {
    bloques: [
      {
        ejercicioId: PRESS.id,
        series: 4,
        micropausaSegundos: 60,
        macropausaSegundos: 90,
        repeticiones: 8,
      },
    ],
  };

  it('editar una rutina de otro profesor responde RN-PLAN-08 (no encontrado)', async () => {
    const deOtro = guardarRutina('u-diego', 'Pecho');

    const error = await editarRutina.ejecutar('u-laura', deOtro, pedido).catch((e: unknown) => e);

    expect(codigoDe(error)).toEqual(['RN-PLAN-08', 'no-encontrado']);
  });

  it('editar una rutina inexistente responde RN-PLAN-08 (no encontrado)', async () => {
    const error = await editarRutina
      .ejecutar('u-laura', 'no-existe', pedido)
      .catch((e: unknown) => e);

    expect(codigoDe(error)).toEqual(['RN-PLAN-08', 'no-encontrado']);
  });
});

describe('RN-PLAN-01 · la rutina tiene al menos un bloque o un circuito', () => {
  it('editar sin bloques ni circuitos responde RN-PLAN-01 y la rutina sigue con su bloque', async () => {
    const id = guardarRutina('u-laura', 'Pecho');

    const error = await editarRutina
      .ejecutar('u-laura', id, { bloques: [], circuitos: [] })
      .catch((e: unknown) => e);

    const guardada = await rutinas.buscarPorId(id);
    expect([codigoDe(error), guardada?.bloques.length]).toEqual([['RN-PLAN-01', 'validacion'], 1]);
  });
});

describe('RN-PLAN-06 · la rutina referencia ejercicios del catálogo que tienen que existir', () => {
  it('editar con un ejercicio inexistente responde RN-PLAN-06 y la rutina no cambia', async () => {
    const id = guardarRutina('u-laura', 'Pecho');

    const error = await editarRutina
      .ejecutar('u-laura', id, {
        bloques: [
          {
            ejercicioId: 'no-existe',
            series: 4,
            micropausaSegundos: 60,
            macropausaSegundos: 90,
            repeticiones: 8,
          },
        ],
      })
      .catch((e: unknown) => e);

    const guardada = await rutinas.buscarPorId(id);
    expect([codigoDe(error), guardada?.bloques.map((b) => b.series)]).toEqual([
      ['RN-PLAN-06', 'no-encontrado'],
      [3],
    ]);
  });
});

describe('RN-PLAN-21 · el nombre no repite el de otra rutina del mismo profesor', () => {
  const bloques = [
    {
      ejercicioId: PRESS.id,
      series: 4,
      micropausaSegundos: 60,
      macropausaSegundos: 90,
      repeticiones: 8,
    },
  ];

  it("editar 'Pecho' con el nombre 'piernas' cuando ya existe 'Piernas' responde RN-PLAN-21 (conflicto)", async () => {
    guardarRutina('u-laura', 'Piernas');
    const pecho = guardarRutina('u-laura', 'Pecho');

    const error = await editarRutina
      .ejecutar('u-laura', pecho, { nombre: 'piernas', bloques })
      .catch((e: unknown) => e);

    expect(codigoDe(error)).toEqual(['RN-PLAN-21', 'conflicto']);
  });

  it("editar 'Pecho' conservando el nombre 'Pecho' se acepta", async () => {
    const pecho = guardarRutina('u-laura', 'Pecho');

    await editarRutina.ejecutar('u-laura', pecho, { nombre: 'Pecho', bloques });

    expect((await rutinas.buscarPorId(pecho))?.bloques.map((b) => b.series)).toEqual([4]);
  });
});
