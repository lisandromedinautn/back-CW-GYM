import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Notificacion } from './notificacion.entidad.js';
import { Percepcion } from './percepcion.valor.js';

const datosBase = {
  id: 'n1',
  profesorId: 'p1',
  alumno: { id: 'a1', nombre: 'Santiago', apellido: 'Medina' },
  entrenamiento: { id: 'e1', rutina: 'Empuje', inicio: '2026-11-24T10:00:00.000Z' },
  totalSeries: 5,
  creada: '2026-11-24T10:30:00.000Z',
};

const serie = {
  orden: 1,
  numero: 3,
  posicion: null,
  ejercicioId: 'ej1',
  nombre: 'Press banca',
  prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
  realizada: null,
};

describe('RN-NOT-01 · una notificación requiere al menos una serie por debajo', () => {
  it('sin series por debajo no se crea → RN-NOT-01', () => {
    try {
      Notificacion.crear({ ...datosBase, seriesPorDebajo: [] });
      expect.fail('debía lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorDominio);
      expect((e as ErrorDominio).codigo).toBe('RN-NOT-01');
    }
  });
});

describe('RN-NOT-04 · una notificación nace no leída y marcarla leída es idempotente', () => {
  it('nace no leída; queda leída a las 11:00 y no cambia al marcar a las 12:00', () => {
    const n = Notificacion.crear({ ...datosBase, seriesPorDebajo: [serie] });
    expect(n.leida).toBe(false);

    n.marcarLeida(new Date('2026-11-24T11:00:00.000Z'));
    expect(n.leida).toBe(true);
    expect(n.datos.leidaEn).toBe('2026-11-24T11:00:00.000Z');

    n.marcarLeida(new Date('2026-11-24T12:00:00.000Z'));
    expect(n.datos.leidaEn).toBe('2026-11-24T11:00:00.000Z');
  });
});

describe('RN-NOT-05, 06, 07 · la percepción se suma a la notificación y la crea cuando es mala', () => {
  it('RN-NOT-05, 07 · Leve leída a las 11:00 + 10/1 → Grave, no leída, con percepción; Leve leída + 8/3 → Leve y no leída', () => {
    const conMala = Notificacion.crear({ ...datosBase, seriesPorDebajo: [serie] });
    conMala.marcarLeida(new Date('2026-11-24T11:00:00.000Z'));
    conMala.sumarPercepcion(Percepcion.crear({ rpe: 10, sensacionFuerza: 1 }));
    expect(conMala.datos.gravedad).toBe('grave');
    expect(conMala.leida).toBe(false);
    expect(conMala.datos.percepcion).toEqual({ rpe: 10, sensacionFuerza: 1 });

    const conBuena = Notificacion.crear({ ...datosBase, seriesPorDebajo: [serie] });
    conBuena.marcarLeida(new Date('2026-11-24T11:00:00.000Z'));
    conBuena.sumarPercepcion(Percepcion.crear({ rpe: 8, sensacionFuerza: 3 }));
    expect(conBuena.datos.gravedad).toBe('leve');
    expect(conBuena.leida).toBe(false);
  });

  it('RN-NOT-01, 06 · crearPorPercepcion con 7/2 → Leve, sin series y no leída; con 8/3 → RN-NOT-01', () => {
    const n = Notificacion.crearPorPercepcion({
      ...datosBase,
      percepcion: Percepcion.crear({ rpe: 7, sensacionFuerza: 2 }),
    });
    expect(n.datos.gravedad).toBe('leve');
    expect(n.datos.seriesPorDebajo).toEqual([]);
    expect(n.leida).toBe(false);

    try {
      Notificacion.crearPorPercepcion({
        ...datosBase,
        percepcion: Percepcion.crear({ rpe: 8, sensacionFuerza: 3 }),
      });
      expect.fail('debía lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorDominio);
      expect((e as ErrorDominio).codigo).toBe('RN-NOT-01');
    }
  });
});
