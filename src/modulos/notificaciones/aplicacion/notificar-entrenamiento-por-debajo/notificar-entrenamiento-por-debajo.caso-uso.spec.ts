import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaProfesoresFija,
  RepositorioNotificacionesEnMemoria,
} from '../../../../../test/dobles/notificaciones.js';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';
import type {
  MedidaSerie,
  SeriePorDebajo,
} from '../../dominio/notificacion/serie-por-debajo.valor.js';
import { NotificarEntrenamientoPorDebajo } from './notificar-entrenamiento-por-debajo.caso-uso.js';

const medida = (repeticiones: number, pesoKg: number): MedidaSerie => ({
  repeticiones,
  segundos: null,
  pesoKg,
});

const prescripta = medida(10, 30);

const serie = (numero: number, realizada: MedidaSerie | null): SeriePorDebajo => ({
  orden: 1,
  numero,
  posicion: null,
  ejercicioId: 'press',
  nombre: 'Press de banca',
  prescripta,
  realizada,
});

/** Ejemplo de RN-ENT-21: press de 5 series de 10 × 30; por debajo la 3 (8 × 30), la 4 (10 × 25) y la 5 (sin registrar). */
const seriesPorDebajoEjemplo = [serie(3, medida(8, 30)), serie(4, medida(10, 25)), serie(5, null)];

const evento = (
  alumnoId: string,
  seriesPorDebajo: SeriePorDebajo[],
): EntrenamientoFinalizadoRecibido => ({
  nombre: 'EntrenamientoFinalizado',
  entrenamientoId: 'e1',
  alumnoId,
  fin: '2026-11-24T11:00:00.000Z',
  inicio: '2026-11-24T10:00:00.000Z',
  rutina: 'Fuerza',
  totalSeries: 5,
  seriesPorDebajo,
});

describe('RN-NOT-01 · el profesor recibe una notificación por entrenamiento por debajo', () => {
  let repositorio: RepositorioNotificacionesEnMemoria;
  let notificar: NotificarEntrenamientoPorDebajo;

  beforeEach(() => {
    repositorio = new RepositorioNotificacionesEnMemoria();
    notificar = new NotificarEntrenamientoPorDebajo(
      repositorio,
      new ConsultaProfesoresFija(
        { a1: { profesorId: 'p1', alumno: { id: 'a1', nombre: 'Santiago', apellido: 'Medina' } } },
        { u1: 'p1', u2: 'p2' },
      ),
      new RelojFijo(new Date('2026-11-24T11:00:05.000Z')),
    );
  });

  it('RN-NOT-01, 02 · notifica al profesor del alumno', async () => {
    await notificar.ejecutar(evento('a1', seriesPorDebajoEjemplo));

    const guardadas = repositorio.todas();
    expect(guardadas).toHaveLength(1);
    const datos = guardadas[0]!.datos;
    expect(datos.profesorId).toBe('p1');
    expect(datos.gravedad).toBe('grave');
    expect(datos.alumno).toEqual({ id: 'a1', nombre: 'Santiago', apellido: 'Medina' });
    expect(datos.totalSeries).toBe(5);
    expect(datos.seriesPorDebajo.map((s) => s.numero)).toEqual([3, 4, 5]);
  });

  it('RN-NOT-01 · sin series por debajo no notifica', async () => {
    await notificar.ejecutar(evento('a1', []));

    expect(repositorio.todas()).toHaveLength(0);
  });

  it('RN-NOT-01 · alumno sin profesor no notifica', async () => {
    await notificar.ejecutar(evento('a2', seriesPorDebajoEjemplo));

    expect(repositorio.todas()).toHaveLength(0);
  });

  it('RN-NOT-01 · una por entrenamiento', async () => {
    await notificar.ejecutar(evento('a1', seriesPorDebajoEjemplo));
    await notificar.ejecutar(evento('a1', seriesPorDebajoEjemplo));

    expect(repositorio.todas()).toHaveLength(1);
  });
});
