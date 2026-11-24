import { describe, expect, it } from 'vitest';
import type { CopiaRutina, EjercicioPrescriptoCopiado } from './copia-rutina.valor.js';
import type { SerieRealizada } from './serie-realizada.valor.js';
import { seriesPorDebajo } from './series-por-debajo.js';

const ejercicio = (
  ejercicioId: string,
  nombre: string,
  medida: { repeticiones?: number; segundos?: number; pesoKg?: number },
): EjercicioPrescriptoCopiado => ({
  ejercicioId,
  nombre,
  repeticiones: medida.repeticiones ?? null,
  segundos: medida.segundos ?? null,
  pesoKg: medida.pesoKg ?? null,
});

const copiaConBloque = (series: number, e: EjercicioPrescriptoCopiado): CopiaRutina => ({
  id: 'r',
  nombre: 'Rutina',
  tipo: 'Bloques',
  bloques: [{ ...e, orden: 1, series, micropausaSegundos: 0, macropausaSegundos: 0 }],
  circuitos: [],
});

const serie = (
  e: EjercicioPrescriptoCopiado,
  numero: number,
  realizada: { repeticiones?: number; segundos?: number; pesoKg?: number },
  orden = 1,
  posicion: number | null = null,
): SerieRealizada => ({
  orden,
  numero,
  posicion,
  ejercicioId: e.ejercicioId,
  nombre: e.nombre,
  prescripta: { repeticiones: e.repeticiones, segundos: e.segundos, pesoKg: e.pesoKg },
  realizada: {
    repeticiones: realizada.repeticiones ?? null,
    segundos: realizada.segundos ?? null,
    pesoKg: realizada.pesoKg ?? null,
  },
});

describe('RN-ENT-21 · series por debajo de lo prescripto', () => {
  const press = ejercicio('press', 'Press', { repeticiones: 10, pesoKg: 30 });

  it('ejemplo de la regla: 3 series por debajo de 5 (repeticiones, peso y sin registrar)', () => {
    const resultado = seriesPorDebajo(copiaConBloque(5, press), [
      serie(press, 1, { repeticiones: 10, pesoKg: 30 }),
      serie(press, 2, { repeticiones: 10, pesoKg: 30 }),
      serie(press, 3, { repeticiones: 8, pesoKg: 30 }),
      serie(press, 4, { repeticiones: 10, pesoKg: 25 }),
    ]);
    expect(resultado.totalSeries).toBe(5);
    expect(resultado.porDebajo.map((s) => s.numero)).toEqual([3, 4, 5]);
    expect(resultado.porDebajo[2].realizada).toBeNull();
    expect(resultado.porDebajo[0].realizada).toEqual({
      repeticiones: 8,
      segundos: null,
      pesoKg: 30,
    });
    expect(resultado.porDebajo[0].prescripta).toEqual({
      repeticiones: 10,
      segundos: null,
      pesoKg: 30,
    });
  });

  it('cumplir o superar no deja series por debajo', () => {
    const resultado = seriesPorDebajo(copiaConBloque(2, press), [
      serie(press, 1, { repeticiones: 10, pesoKg: 30 }),
      serie(press, 2, { repeticiones: 12, pesoKg: 35 }),
    ]);
    expect(resultado.totalSeries).toBe(2);
    expect(resultado.porDebajo).toEqual([]);
  });

  it('sin peso prescripto no se compara el peso', () => {
    const dominada = ejercicio('dominada', 'Dominada', { repeticiones: 8 });
    const resultado = seriesPorDebajo(copiaConBloque(2, dominada), [
      serie(dominada, 1, { repeticiones: 8 }),
      serie(dominada, 2, { repeticiones: 8, pesoKg: 5 }),
    ]);
    expect(resultado.porDebajo).toEqual([]);
  });

  it('peso prescripto no informado cuenta como 0', () => {
    const resultado = seriesPorDebajo(copiaConBloque(1, press), [
      serie(press, 1, { repeticiones: 10 }),
    ]);
    expect(resultado.totalSeries).toBe(1);
    expect(resultado.porDebajo).toHaveLength(1);
  });

  it('por tiempo', () => {
    const plancha = ejercicio('plancha', 'Plancha', { segundos: 60 });
    const resultado = seriesPorDebajo(copiaConBloque(2, plancha), [
      serie(plancha, 1, { segundos: 60 }),
      serie(plancha, 2, { segundos: 45 }),
    ]);
    expect(resultado.totalSeries).toBe(2);
    expect(resultado.porDebajo.map((s) => s.numero)).toEqual([2]);
  });

  it('circuito cuenta cada ejercicio de cada vuelta', () => {
    const sentadilla = ejercicio('sentadilla', 'Sentadilla', { repeticiones: 15 });
    const flexiones = ejercicio('flexiones', 'Flexiones', { repeticiones: 10 });
    const copia: CopiaRutina = {
      id: 'r',
      nombre: 'Rutina',
      tipo: 'Circuitos',
      bloques: [],
      circuitos: [
        { orden: 1, vueltas: 2, macropausaSegundos: 0, ejercicios: [sentadilla, flexiones] },
      ],
    };
    const resultado = seriesPorDebajo(copia, [
      serie(sentadilla, 1, { repeticiones: 15 }, 1, 1),
      serie(flexiones, 1, { repeticiones: 10 }, 1, 2),
      serie(sentadilla, 2, { repeticiones: 15 }, 1, 1),
    ]);
    expect(resultado.totalSeries).toBe(4);
    expect(resultado.porDebajo).toHaveLength(1);
    expect(resultado.porDebajo[0]).toMatchObject({ numero: 2, posicion: 2, realizada: null });
  });
});
