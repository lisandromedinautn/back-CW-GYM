import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaEjerciciosFalsa,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { CrearRutina, type PedidoCircuito } from './crear-rutina.caso-uso.js';

describe('RN-PLAN-06 · los ejercicios de un circuito tienen que existir en el catálogo', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let crearRutina: CrearRutina;

  const circuito = (...ejercicioIds: string[]): PedidoCircuito => ({
    vueltas: 3,
    macropausaSegundos: 90,
    ejercicios: ejercicioIds.map((ejercicioId) =>
      ejercicioId === 'weighted-front-plank'
        ? { ejercicioId, segundos: 45 }
        : { ejercicioId, repeticiones: 10 },
    ),
  });

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    crearRutina = new CrearRutina(
      rutinas,
      new ConsultaEjerciciosFalsa([
        { id: 'lever-chest-press', porTiempo: false, admitePesoExtra: true },
        { id: 'weighted-front-plank', porTiempo: true, admitePesoExtra: true },
      ]),
    );
  });

  it('con un ejercicio inexistente en el circuito se rechaza con RN-PLAN-06 (no encontrado)', async () => {
    const error = await crearRutina
      .ejecutar('u-laura', { circuitos: [circuito('lever-chest-press', 'no-existe')] })
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-06',
      'no-encontrado',
    ]);
  });

  it('con ejercicios existentes el circuito queda guardado para el profesor u-laura', async () => {
    await crearRutina.ejecutar('u-laura', {
      circuitos: [circuito('lever-chest-press', 'weighted-front-plank')],
    });

    expect(
      rutinas.rutinas.map((rutina) => [rutina.profesorUsuarioId, rutina.circuitos.length]),
    ).toEqual([['u-laura', 1]]);
  });
});
