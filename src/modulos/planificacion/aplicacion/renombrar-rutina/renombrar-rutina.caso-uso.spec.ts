import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { RenombrarRutina } from './renombrar-rutina.caso-uso.js';

describe('RN-PLAN-21 · renombrar a un nombre que ya usa otra rutina del mismo profesor se rechaza con conflicto', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let renombrarRutina: RenombrarRutina;

  // Se guarda sin pasar por el caso de uso: la semilla no depende de la regla que se prueba.
  const guardarRutina = (profesorUsuarioId: string, nombre: string): string => {
    const id = randomUUID();
    rutinas.guardar(Rutina.reconstruir(id, profesorUsuarioId, [], [], nombre));
    return id;
  };

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    renombrarRutina = new RenombrarRutina(rutinas);
  });

  it("renombrar 'Pecho' a '  PIERNAS ' cuando u-laura ya tiene 'Piernas' se rechaza con RN-PLAN-21 (conflicto)", async () => {
    guardarRutina('u-laura', 'Piernas');
    const pecho = guardarRutina('u-laura', 'Pecho');

    const error = await renombrarRutina
      .ejecutar('u-laura', pecho, '  PIERNAS ')
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-21',
      'conflicto',
    ]);
  });
});

describe('RN-PLAN-08 · un profesor solo ve y edita sus propias rutinas', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let renombrarRutina: RenombrarRutina;

  const guardarRutina = (profesorUsuarioId: string, nombre: string): string => {
    const id = randomUUID();
    rutinas.guardar(Rutina.reconstruir(id, profesorUsuarioId, [], [], nombre));
    return id;
  };

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    renombrarRutina = new RenombrarRutina(rutinas);
  });

  it('renombrar una rutina de otro profesor responde RN-PLAN-08 (no encontrado)', async () => {
    const deOtro = guardarRutina('u-otro', 'Pecho');

    const error = await renombrarRutina
      .ejecutar('u-laura', deOtro, 'Piernas')
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-08',
      'no-encontrado',
    ]);
  });

  it('renombrar una rutina con id inexistente responde RN-PLAN-08 (no encontrado)', async () => {
    const error = await renombrarRutina
      .ejecutar('u-laura', 'no-existe', 'Piernas')
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-08',
      'no-encontrado',
    ]);
  });
});
