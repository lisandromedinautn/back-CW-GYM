import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import { ConsultarNotificaciones } from './consultar-notificaciones.caso-uso.js';

const notificacion = (id: string, profesorId: string, creada: string, leida = false) => {
  const n = Notificacion.crear({
    id,
    profesorId,
    alumno: { id: 'a1', nombre: 'Santiago', apellido: 'Medina' },
    entrenamiento: { id: `e-${id}`, rutina: 'Fuerza', inicio: creada },
    totalSeries: 5,
    seriesPorDebajo: [
      {
        orden: 1,
        numero: 5,
        posicion: null,
        ejercicioId: 'press',
        nombre: 'Press de banca',
        prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
        realizada: null,
      },
    ],
    creada,
  });
  if (leida) n.marcarLeida(new Date(creada));
  return n;
};

describe('RN-NOT-03 · el profesor ve solo sus notificaciones, de la más nueva a la más vieja', () => {
  let consultar: ConsultarNotificaciones;

  beforeEach(async () => {
    const repositorio = new RepositorioNotificacionesEnMemoria();
    await repositorio.guardar(notificacion('n10', 'p1', '2026-11-24T10:00:00.000Z'));
    await repositorio.guardar(notificacion('n11', 'p1', '2026-11-24T11:00:00.000Z', true));
    await repositorio.guardar(notificacion('n12', 'p1', '2026-11-24T12:00:00.000Z'));
    await repositorio.guardar(notificacion('nx', 'p2', '2026-11-24T13:00:00.000Z'));
    consultar = new ConsultarNotificaciones(
      repositorio,
      new ConsultaProfesoresFija({}, { u1: 'p1', u2: 'p2' }),
    );
  });

  it('RN-NOT-03 · solo las propias, de la más nueva a la más vieja', async () => {
    const resultado = await consultar.ejecutar('u1', { pagina: 1, tamanio: 2 });

    expect(resultado.items.map((i) => i.id)).toEqual(['n12', 'n11']);
    expect(resultado.total).toBe(3);
    expect(resultado.noLeidas).toBe(2);
    expect(resultado.items.map((i) => i.leida)).toEqual([false, true]);
  });
});
