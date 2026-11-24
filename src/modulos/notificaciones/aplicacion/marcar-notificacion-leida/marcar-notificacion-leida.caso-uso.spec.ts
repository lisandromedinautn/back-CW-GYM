import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import { MarcarNotificacionLeida } from './marcar-notificacion-leida.caso-uso.js';

const notificacion = (id: string, profesorId: string, creada: string) =>
  Notificacion.crear({
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

const errorDe = async (accion: () => Promise<unknown>): Promise<ErrorDominio | undefined> => {
  try {
    await accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error;
    throw error;
  }
  return undefined;
};

describe('RN-NOT-04 · el profesor marca como leída su notificación', () => {
  let repositorio: RepositorioNotificacionesEnMemoria;
  let marcar: MarcarNotificacionLeida;

  beforeEach(async () => {
    repositorio = new RepositorioNotificacionesEnMemoria();
    await repositorio.guardar(notificacion('n10', 'p1', '2026-11-24T10:00:00.000Z'));
    await repositorio.guardar(notificacion('n11', 'p1', '2026-11-24T11:00:00.000Z'));
    marcar = new MarcarNotificacionLeida(
      repositorio,
      new ConsultaProfesoresFija({}, { u1: 'p1', u2: 'p2' }),
      new RelojFijo(new Date('2026-11-24T14:00:00.000Z')),
    );
  });

  it('RN-NOT-04 · marca la propia', async () => {
    await marcar.ejecutar('u1', 'n10');

    expect((await repositorio.buscarPorId('n10'))!.leida).toBe(true);
    expect(await repositorio.contarNoLeidas('p1')).toBe(1);
  });

  it('RN-NOT-04 · ajena o inexistente', async () => {
    const ajena = await errorDe(() => marcar.ejecutar('u2', 'n10'));
    const inexistente = await errorDe(() => marcar.ejecutar('u1', 'no-existe'));

    expect(ajena?.codigo).toBe(CODIGO_NO_ENCONTRADO);
    expect(ajena?.categoria).toBe('no-encontrado');
    expect(inexistente?.codigo).toBe(CODIGO_NO_ENCONTRADO);
    expect(inexistente?.categoria).toBe('no-encontrado');
    expect((await repositorio.buscarPorId('n10'))!.leida).toBe(false);
  });
});
