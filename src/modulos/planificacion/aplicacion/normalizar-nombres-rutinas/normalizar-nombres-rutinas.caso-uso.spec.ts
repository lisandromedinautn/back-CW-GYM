import { beforeEach, describe, expect, it } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import type { EjercicioDelCatalogo } from '../../dominio/rutina/ejercicio-del-catalogo.js';
import { type DatosBloque, Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { NormalizarNombresRutinas } from './normalizar-nombres-rutinas.caso-uso.js';

// Ejercicio del fixture (test/datasets/ejercicios-fixture.json), como lo ve planificación.
const PRESS_PECHO: EjercicioDelCatalogo = {
  id: 'lever-chest-press',
  porTiempo: false,
  admitePesoExtra: true, // Peso Extra
};

const bloque: DatosBloque = {
  ejercicio: PRESS_PECHO,
  series: 3,
  micropausaSegundos: 60,
  macropausaSegundos: 120,
  repeticiones: 10,
};

describe('RN-PLAN-21 · al arrancar, las rutinas repetidas de un profesor pasan al siguiente "Rutina N" libre (la más vieja conserva el nombre)', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let normalizar: NormalizarNombresRutinas;

  // Rutina ya guardada, como quedaron las filas anteriores a la columna nombre. Se guarda sin pasar
  // por el caso de uso para que la semilla no dependa de la regla que se prueba.
  const guardarRutina = async (profesorUsuarioId: string, nombre: string): Promise<void> => {
    await rutinas.guardar(Rutina.crear({ profesorUsuarioId, nombre, bloques: [bloque] }));
  };
  const nombres = (): string[] => rutinas.rutinas.map((rutina) => rutina.nombre);

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    normalizar = new NormalizarNombresRutinas(rutinas);
  });

  it("u-laura con 'Rutina 1' y 'Rutina 1' (en ese orden): la segunda pasa a 'Rutina 2'; devuelve 1", async () => {
    await guardarRutina('u-laura', 'Rutina 1');
    await guardarRutina('u-laura', 'Rutina 1');

    const renombradas = await normalizar.ejecutar();

    expect([nombres(), renombradas]).toEqual([['Rutina 1', 'Rutina 2'], 1]);
  });

  it("u-laura con 'Rutina 1', 'Rutina 1' y 'Rutina 2': la segunda pasa a 'Rutina 3' y la 'Rutina 2' no cambia; devuelve 1", async () => {
    await guardarRutina('u-laura', 'Rutina 1');
    await guardarRutina('u-laura', 'Rutina 1');
    await guardarRutina('u-laura', 'Rutina 2');

    const renombradas = await normalizar.ejecutar();

    expect([nombres(), renombradas]).toEqual([['Rutina 1', 'Rutina 3', 'Rutina 2'], 1]);
  });

  it("u-laura con 'Empuje' y 'Piernas': no cambia nada; devuelve 0", async () => {
    await guardarRutina('u-laura', 'Empuje');
    await guardarRutina('u-laura', 'Piernas');

    const renombradas = await normalizar.ejecutar();

    expect([nombres(), renombradas]).toEqual([['Empuje', 'Piernas'], 0]);
  });

  it("u-laura y u-pablo con 'Rutina 1' cada uno: son de distintos profesores, no cambia nada; devuelve 0", async () => {
    await guardarRutina('u-laura', 'Rutina 1');
    await guardarRutina('u-pablo', 'Rutina 1');

    const renombradas = await normalizar.ejecutar();

    expect([nombres(), renombradas]).toEqual([['Rutina 1', 'Rutina 1'], 0]);
  });

  it("u-laura con 'Piernas' y '  piernas ': la segunda pasa a 'Rutina 1' (el nombre libre); devuelve 1", async () => {
    await guardarRutina('u-laura', 'Piernas');
    await guardarRutina('u-laura', '  piernas ');

    const renombradas = await normalizar.ejecutar();

    expect([nombres(), renombradas]).toEqual([['Piernas', 'Rutina 1'], 1]);
  });
});
