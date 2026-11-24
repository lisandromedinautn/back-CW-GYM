import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ConsultarRutinas } from './consultar-rutinas.caso-uso.js';

// Casos confirmados por Martina el 24/11/2026 (US06, detalle para editar).
describe('RN-PLAN-08 · un profesor solo ve sus propias rutinas', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let consultarRutinas: ConsultarRutinas;

  const guardarRutina = (profesorUsuarioId: string, nombre: string): string => {
    const id = randomUUID();
    rutinas.guardar(Rutina.reconstruir(id, profesorUsuarioId, [], [], nombre));
    return id;
  };

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    consultarRutinas = new ConsultarRutinas(rutinas);
  });

  it("u-laura consulta por id su rutina 'Pecho' y la recibe", async () => {
    const id = guardarRutina('u-laura', 'Pecho');

    const rutina = await consultarRutinas.porId('u-laura', id);

    expect([rutina.id === id, rutina.nombre]).toEqual([true, 'Pecho']);
  });

  it('consultar por id una rutina de otro profesor responde RN-PLAN-08 (no encontrado)', async () => {
    const deOtro = guardarRutina('u-diego', 'Pecho');

    const error = await consultarRutinas.porId('u-laura', deOtro).catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-08',
      'no-encontrado',
    ]);
  });
});
