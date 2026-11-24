import { describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import { ContarNoLeidas } from './contar-no-leidas.caso-uso.js';

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

describe('RN-NOT-03 · el profesor ve la cantidad de notificaciones no leídas', () => {
  it('RN-NOT-03 · cuenta las no leídas propias', async () => {
    const repositorio = new RepositorioNotificacionesEnMemoria();
    await repositorio.guardar(notificacion('n10', 'p1', '2026-11-24T10:00:00.000Z'));
    await repositorio.guardar(notificacion('n11', 'p1', '2026-11-24T11:00:00.000Z', true));
    await repositorio.guardar(notificacion('n12', 'p1', '2026-11-24T12:00:00.000Z'));
    await repositorio.guardar(notificacion('nx', 'p2', '2026-11-24T13:00:00.000Z'));
    const contar = new ContarNoLeidas(
      repositorio,
      new ConsultaProfesoresFija({}, { u1: 'p1', u2: 'p2' }),
    );

    expect(await contar.ejecutar('u1')).toEqual({ cantidad: 2 });
  });
});
