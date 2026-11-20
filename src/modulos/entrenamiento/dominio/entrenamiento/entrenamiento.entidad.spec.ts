import { describe, expect, it } from 'vitest';
import { Entrenamiento } from './entrenamiento.entidad.js';

describe('RN-ENT-02 · el inicio conserva una copia independiente', () => {
  it('conserva peso, hora y prescripción ordenada', () => {
    const rutina = {
      id: 'rutina',
      nombre: 'Mixta',
      tipo: 'Mixta',
      bloques: [
        {
          orden: 2,
          ejercicioId: 'press',
          nombre: 'Press',
          series: 3,
          micropausaSegundos: 20,
          macropausaSegundos: 60,
          repeticiones: 10,
          segundos: null,
          pesoKg: 30,
        },
      ],
      circuitos: [{ orden: 1, vueltas: 2, macropausaSegundos: 60, ejercicios: [] }],
    };
    const datos = {
      id: 'entrenamiento',
      alumnoId: 'alumno',
      inicio: '2026-11-20T23:59:00.000Z',
      pesoCorporalKg: 80,
      rutina,
    };
    const entrenamiento = Entrenamiento.crear(datos);
    datos.pesoCorporalKg = 85;
    rutina.bloques[0].orden = 1;
    rutina.bloques[0].repeticiones = 12;
    expect(entrenamiento.datos).toMatchObject({
      inicio: '2026-11-20T23:59:00.000Z',
      pesoCorporalKg: 80,
      rutina: { bloques: [{ orden: 2, repeticiones: 10 }], circuitos: [{ orden: 1 }] },
    });
    expect(entrenamiento.eventoDeInicio()).toMatchObject({
      nombre: 'EntrenamientoIniciado',
      entrenamientoId: 'entrenamiento',
    });
  });
});

describe('RN-ENT-20 · el entrenamiento queda abandonado a medianoche UTC', () => {
  it('se retoma antes de medianoche pero no al cambiar el día', () => {
    const entrenamiento = Entrenamiento.crear({
      id: 'entrenamiento',
      alumnoId: 'alumno',
      inicio: '2026-11-20T23:59:00.000Z',
      pesoCorporalKg: 80,
      rutina: { id: 'rutina', nombre: 'Rutina', tipo: 'Bloques', bloques: [], circuitos: [] },
    });
    expect(entrenamiento.estadoEn(new Date('2026-11-20T23:59:59.999Z'))).toBe('en-curso');
    expect(entrenamiento.estadoEn(new Date('2026-11-21T00:00:00.000Z'))).toBe('abandonado');
  });
});
