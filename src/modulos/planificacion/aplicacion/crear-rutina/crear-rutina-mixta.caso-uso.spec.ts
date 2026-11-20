import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaEjerciciosFalsa,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { CrearRutina, type PedidoBloque, type PedidoCircuito } from './crear-rutina.caso-uso.js';

describe('RN-PLAN-01 · una rutina mixta guarda bloques y circuitos en el orden indicado', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let crearRutina: CrearRutina;

  const bloque = (orden: number): PedidoBloque => ({
    orden,
    ejercicioId: 'lever-chest-press',
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 120,
    repeticiones: 10,
  });

  const circuito = (orden: number): PedidoCircuito => ({
    orden,
    vueltas: 3,
    macropausaSegundos: 90,
    ejercicios: [
      { ejercicioId: 'lever-chest-press', repeticiones: 10 },
      { ejercicioId: 'weighted-front-plank', segundos: 45 },
    ],
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

  it('circuito (1), bloque (2) y circuito (3) quedan guardados en ese orden', async () => {
    await crearRutina.ejecutar('u-laura', {
      bloques: [bloque(2)],
      circuitos: [circuito(1), circuito(3)],
    });

    expect(rutinas.rutinas.map((rutina) => rutina.elementos.map((e) => e.tipo))).toEqual([
      ['circuito', 'bloque', 'circuito'],
    ]);
  });
});
