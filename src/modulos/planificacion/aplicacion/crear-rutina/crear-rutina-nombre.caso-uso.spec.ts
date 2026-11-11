import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaEjerciciosFalsa,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { CrearRutina, type PedidoBloque } from './crear-rutina.caso-uso.js';

const bloque: PedidoBloque = {
  ejercicioId: 'lever-chest-press',
  series: 3,
  micropausaSegundos: 60,
  macropausaSegundos: 120,
  repeticiones: 10,
};

const sinNombre = () => ({ bloques: [bloque] });
const conNombre = (nombre: string) => ({ nombre, bloques: [bloque] });

describe('RN-PLAN-21 · sin nombre, la rutina se llama "Rutina N" con N = rutinas del profesor + 1', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let crearRutina: CrearRutina;

  // Rutina ya guardada del profesor. Se guarda sin pasar por el caso de uso para que la semilla
  // no dependa de la regla que se prueba.
  const guardarRutina = (profesorUsuarioId: string, nombre: string) =>
    rutinas.guardar(Rutina.reconstruir(randomUUID(), profesorUsuarioId, [], [], nombre));

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    crearRutina = new CrearRutina(
      rutinas,
      new ConsultaEjerciciosFalsa([
        { id: 'lever-chest-press', porTiempo: false, admitePesoExtra: true },
      ]),
    );
  });

  it('con 2 rutinas del profesor u-laura, la nueva se llama "Rutina 3"', async () => {
    guardarRutina('u-laura', 'Rutina 1');
    guardarRutina('u-laura', 'Rutina 2');

    const nueva = await crearRutina.ejecutar('u-laura', sinNombre());

    expect(nueva.nombre).toBe('Rutina 3');
  });

  it('con 0 rutinas de u-laura y 2 de otro profesor, la nueva se llama "Rutina 1"', async () => {
    guardarRutina('u-otro', 'Rutina 1');
    guardarRutina('u-otro', 'Rutina 2');

    const nueva = await crearRutina.ejecutar('u-laura', sinNombre());

    expect(nueva.nombre).toBe('Rutina 1');
  });

  it('con 2 rutinas de u-laura y una llamada "Rutina 3", la nueva se llama "Rutina 4"', async () => {
    guardarRutina('u-laura', 'Rutina 1');
    guardarRutina('u-laura', 'Rutina 3');

    const nueva = await crearRutina.ejecutar('u-laura', sinNombre());

    expect(nueva.nombre).toBe('Rutina 4');
  });
});

describe('RN-PLAN-21 · un profesor no puede tener dos rutinas con el mismo nombre (sin mayúsculas ni espacios de los extremos)', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let crearRutina: CrearRutina;

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    crearRutina = new CrearRutina(
      rutinas,
      new ConsultaEjerciciosFalsa([
        { id: 'lever-chest-press', porTiempo: false, admitePesoExtra: true },
      ]),
    );
  });

  it("u-laura crea 'Piernas' y después '  piernas ' se rechaza con RN-PLAN-21 (conflicto)", async () => {
    await crearRutina.ejecutar('u-laura', conNombre('Piernas'));

    const error = await crearRutina
      .ejecutar('u-laura', conNombre('  piernas '))
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-21',
      'conflicto',
    ]);
  });

  it("otro profesor (u-diego) puede crear 'Piernas' aunque u-laura la tenga, y se guarda", async () => {
    await crearRutina.ejecutar('u-laura', conNombre('Piernas'));

    await crearRutina.ejecutar('u-diego', conNombre('Piernas'));

    expect(
      rutinas.rutinas
        .filter((rutina) => rutina.profesorUsuarioId === 'u-diego')
        .map((r) => r.nombre),
    ).toEqual(['Piernas']);
  });
});
