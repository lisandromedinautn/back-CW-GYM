import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { RenombrarRutina } from './renombrar-rutina.caso-uso.js';

describe('RN-PLAN-21 · se puede renombrar una rutina con el mismo nombre que ya tiene (sin contar mayúsculas ni espacios de los extremos)', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let renombrarRutina: RenombrarRutina;

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    renombrarRutina = new RenombrarRutina(rutinas);
  });

  it("renombrar 'Empuje' a 'empuje ' sobre la misma rutina la guarda con el nombre 'empuje'", async () => {
    // Se guarda sin pasar por el caso de uso: la semilla no depende de la regla que se prueba.
    const id = randomUUID();
    await rutinas.guardar(Rutina.reconstruir(id, 'u-laura', [], [], 'Empuje'));
    const guardar = vi.spyOn(rutinas, 'guardar');

    await renombrarRutina.ejecutar('u-laura', id, 'empuje ');

    expect(guardar.mock.calls.map(([rutina]) => rutina.nombre)).toEqual(['empuje']);
  });
});
