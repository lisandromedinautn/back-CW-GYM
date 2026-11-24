import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Notificacion } from './notificacion.entidad.js';

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
