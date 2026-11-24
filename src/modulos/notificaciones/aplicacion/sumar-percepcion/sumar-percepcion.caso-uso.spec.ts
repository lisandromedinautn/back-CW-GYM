import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { PercepcionRegistradaRecibida } from '../../dominio/notificacion/percepcion-registrada-recibida.js';
import { SumarPercepcion } from './sumar-percepcion.caso-uso.js';

const evento = (
  alumnoId: string,
  rpe: number,
  sensacionFuerza: number,
): PercepcionRegistradaRecibida => ({
  nombre: 'PercepcionRegistrada',
  entrenamientoId: 'e1',
  alumnoId,
  inicio: '2026-11-24T10:00:00.000Z',
  rutina: 'Fuerza',
  totalSeries: 5,
  percepcion: { rpe, sensacionFuerza },
});

const notificacionExistente = Notificacion.crear({
  id: 'n1',
  profesorId: 'p1',
  alumno: { id: 'a1', nombre: 'Santiago', apellido: 'Medina' },
  entrenamiento: { id: 'e1', rutina: 'Fuerza', inicio: '2026-11-24T10:00:00.000Z' },
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
  creada: '2026-11-24T11:00:05.000Z',
});

describe('RN-NOT-01, 05, 06 · la percepción se suma a la notificación o la crea si es mala', () => {
  let repositorio: RepositorioNotificacionesEnMemoria;
  let sumar: SumarPercepcion;

  beforeEach(() => {
    repositorio = new RepositorioNotificacionesEnMemoria();
    sumar = new SumarPercepcion(
      repositorio,
      new ConsultaProfesoresFija(
        { a1: { profesorId: 'p1', alumno: { id: 'a1', nombre: 'Santiago', apellido: 'Medina' } } },
        {},
      ),
      new RelojFijo(new Date('2026-11-24T11:00:05.000Z')),
    );
  });

  it('(a) ya hay notificación del entrenamiento de a1; llega 9/3 → la notificación suma la percepción', async () => {
    await repositorio.guardar(notificacionExistente);

    await sumar.ejecutar(evento('a1', 9, 3));

    const guardadas = repositorio.todas();
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0]!.datos.percepcion).toEqual({ rpe: 9, sensacionFuerza: 3 });
  });

  it('(b) sin notificación, a1 con profesor p1; llega 7/2 → se crea una Leve para p1, sin series', async () => {
    await sumar.ejecutar(evento('a1', 7, 2));

    const guardadas = repositorio.todas();
    expect(guardadas).toHaveLength(1);
    const datos = guardadas[0]!.datos;
    expect(datos.profesorId).toBe('p1');
    expect(datos.gravedad).toBe('leve');
    expect(datos.seriesPorDebajo).toEqual([]);
  });

  it('(c) sin notificación; llega 8/3 → no se guarda nada', async () => {
    await sumar.ejecutar(evento('a1', 8, 3));

    expect(repositorio.todas()).toHaveLength(0);
  });

  it('(d) a2 sin profesor; llega 10/1 → no se guarda nada', async () => {
    await sumar.ejecutar(evento('a2', 10, 1));

    expect(repositorio.todas()).toHaveLength(0);
  });
});
