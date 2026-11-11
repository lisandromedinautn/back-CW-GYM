import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ConsultarRutinas } from './consultar-rutinas.caso-uso.js';

describe('RN-PLAN-08 · un profesor solo ve sus propias rutinas', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let consultarRutinas: ConsultarRutinas;

  const guardarRutina = (profesorUsuarioId: string, nombre: string) =>
    rutinas.guardar(Rutina.reconstruir(randomUUID(), profesorUsuarioId, [], [], nombre));

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    consultarRutinas = new ConsultarRutinas(rutinas);
    guardarRutina('u-laura', 'Rutina 1');
    guardarRutina('u-laura', 'Rutina 2');
    guardarRutina('u-otro', 'Rutina 1');
  });

  it('u-laura no ve las rutinas de otro profesor: total 2 y todas son de u-laura', async () => {
    const resultado = await consultarRutinas.ejecutar('u-laura');

    expect({
      total: resultado.total,
      profesores: resultado.items.map((rutina) => rutina.profesorUsuarioId),
    }).toEqual({ total: 2, profesores: ['u-laura', 'u-laura'] });
  });

  it('devuelve { items, total, pagina, tamanio } con pagina 1 y tamanio 10 por defecto', async () => {
    const resultado = await consultarRutinas.ejecutar('u-laura');

    expect(resultado).toEqual({
      items: expect.any(Array),
      total: 2,
      pagina: 1,
      tamanio: 10,
    });
  });
});
