import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioFinalizacionesEnMemoria,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';
import type { SeriePorDebajo } from '../../dominio/notificacion/serie-por-debajo.valor.js';
import { AlertarIncumplimientoRepetido } from './alertar-incumplimiento-repetido.caso-uso.js';

const unaSerie: SeriePorDebajo = {
  orden: 1,
  numero: 1,
  posicion: null,
  ejercicioId: 'press',
  nombre: 'Press de banca',
  prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
  realizada: null,
};

/** El Entrenamiento número `n` (un día por número) de un alumno, por debajo o cumpliendo. */
const finalizado = (
  alumnoId: string,
  n: number,
  porDebajo: boolean,
): EntrenamientoFinalizadoRecibido => ({
  nombre: 'EntrenamientoFinalizado',
  entrenamientoId: `e${n}`,
  alumnoId,
  inicio: new Date(Date.UTC(2026, 10, n, 10)).toISOString(),
  fin: new Date(Date.UTC(2026, 10, n, 11)).toISOString(),
  rutina: `Rutina ${n}`,
  totalSeries: 5,
  seriesPorDebajo: porDebajo ? [unaSerie] : [],
});

describe('RN-NOT-08 · alerta de incumplimiento repetido', () => {
  let notificaciones: RepositorioNotificacionesEnMemoria;
  let alertar: AlertarIncumplimientoRepetido;

  beforeEach(() => {
    notificaciones = new RepositorioNotificacionesEnMemoria();
    alertar = new AlertarIncumplimientoRepetido(
      notificaciones,
      new RepositorioFinalizacionesEnMemoria(),
      new ConsultaProfesoresFija(
        { a1: { profesorId: 'p1', alumno: { id: 'a1', nombre: 'Martín', apellido: 'Pérez' } } },
        {},
      ),
      new RelojFijo(new Date('2026-11-24T12:00:00.000Z')),
    );
  });

  it('el tercer finalizado por debajo genera una alerta Grave, no leída, para el profesor', async () => {
    for (const n of [1, 2, 3]) await alertar.ejecutar(finalizado('a1', n, true));

    const alertas = notificaciones.todas();
    expect(alertas).toHaveLength(1);
    const datos = alertas[0]!.datos;
    expect(datos).toMatchObject({
      tipo: 'alerta-incumplimiento',
      profesorId: 'p1',
      gravedad: 'grave',
      alumno: { id: 'a1', nombre: 'Martín', apellido: 'Pérez' },
      creada: '2026-11-24T12:00:00.000Z',
    });
    expect(alertas[0]!.leida).toBe(false);
    expect(datos.entrenamientos).toEqual([
      { id: 'e1', fecha: '2026-11-01T10:00:00.000Z', rutina: 'Rutina 1' },
      { id: 'e2', fecha: '2026-11-02T10:00:00.000Z', rutina: 'Rutina 2' },
      { id: 'e3', fecha: '2026-11-03T10:00:00.000Z', rutina: 'Rutina 3' },
    ]);
  });

  it('A6 · alumno sin profesor no genera la alerta', async () => {
    for (const n of [1, 2, 3]) await alertar.ejecutar(finalizado('a2', n, true));

    expect(notificaciones.todas()).toHaveLength(0);
  });

  it('con un Entrenamiento que cumple en el medio no hay alerta', async () => {
    await alertar.ejecutar(finalizado('a1', 1, true));
    await alertar.ejecutar(finalizado('a1', 2, false));
    await alertar.ejecutar(finalizado('a1', 3, true));
    await alertar.ejecutar(finalizado('a1', 4, true));

    expect(notificaciones.todas()).toHaveLength(0);
  });

  it('seis seguidos por debajo generan dos alertas: la racha vuelve a cero', async () => {
    for (const n of [1, 2, 3, 4, 5, 6]) await alertar.ejecutar(finalizado('a1', n, true));

    const ancladas = notificaciones.todas().map((a) => a.datos.entrenamiento.id);
    expect(ancladas).toEqual(['e3', 'e6']);
  });

  it('el mismo evento repetido no duplica la alerta', async () => {
    for (const n of [1, 2, 3]) await alertar.ejecutar(finalizado('a1', n, true));
    await alertar.ejecutar(finalizado('a1', 3, true));

    expect(notificaciones.todas()).toHaveLength(1);
  });

  it('no genera alertas retroactivas: solo la del Entrenamiento que llega', async () => {
    const finalizaciones = new RepositorioFinalizacionesEnMemoria();
    const sinProfesor = new AlertarIncumplimientoRepetido(
      notificaciones,
      finalizaciones,
      new ConsultaProfesoresFija({}, {}),
      new RelojFijo(new Date('2026-11-24T12:00:00.000Z')),
    );
    for (const n of [1, 2, 3]) await sinProfesor.ejecutar(finalizado('a1', n, true));
    const conProfesor = new AlertarIncumplimientoRepetido(
      notificaciones,
      finalizaciones,
      new ConsultaProfesoresFija(
        { a1: { profesorId: 'p1', alumno: { id: 'a1', nombre: 'Martín', apellido: 'Pérez' } } },
        {},
      ),
      new RelojFijo(new Date('2026-11-24T12:00:00.000Z')),
    );

    await conProfesor.ejecutar(finalizado('a1', 4, true));

    expect(notificaciones.todas()).toHaveLength(0);
  });
});
