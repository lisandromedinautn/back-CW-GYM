import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
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

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

const enCurso = new Date('2026-11-20T23:59:30.000Z');

/** Bloque orden 2: Press, 3 series de 10 reps con 30 kg. Circuito orden 1: 2 vueltas de Plancha 30 s y Press 8 reps. */
const entrenamientoConRutina = () =>
  Entrenamiento.crear({
    id: 'entrenamiento',
    alumnoId: 'alumno',
    inicio: '2026-11-20T23:59:00.000Z',
    pesoCorporalKg: 80,
    rutina: {
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
      circuitos: [
        {
          orden: 1,
          vueltas: 2,
          macropausaSegundos: 45,
          ejercicios: [
            {
              ejercicioId: 'plancha',
              nombre: 'Plancha',
              repeticiones: null,
              segundos: 30,
              pesoKg: null,
            },
            {
              ejercicioId: 'press',
              nombre: 'Press',
              repeticiones: 8,
              segundos: null,
              pesoKg: null,
            },
          ],
        },
      ],
    },
  });

describe('RN-ENT-03 · la serie realizada queda asociada a la serie prescripta de la copia', () => {
  it('la serie 3 del bloque orden 2 guarda 10 reps y 30 kg prescriptos y 8 reps y 30 kg realizados', () => {
    const entrenamiento = entrenamientoConRutina();
    entrenamiento.registrarSerie({ orden: 2, numero: 3, repeticiones: 8, pesoKg: 30 }, enCurso);
    expect(entrenamiento.datos.series).toEqual([
      {
        orden: 2,
        numero: 3,
        posicion: null,
        ejercicioId: 'press',
        nombre: 'Press',
        prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
        realizada: { repeticiones: 8, segundos: null, pesoKg: 30 },
      },
    ]);
  });

  it('la vuelta 2 del circuito orden 1, posición 1, guarda 30 s prescriptos y 25 s realizados', () => {
    const entrenamiento = entrenamientoConRutina();
    entrenamiento.registrarSerie({ orden: 1, numero: 2, posicion: 1, segundos: 25 }, enCurso);
    expect(entrenamiento.datos.series).toEqual([
      {
        orden: 1,
        numero: 2,
        posicion: 1,
        ejercicioId: 'plancha',
        nombre: 'Plancha',
        prescripta: { repeticiones: null, segundos: 30, pesoKg: null },
        realizada: { repeticiones: null, segundos: 25, pesoKg: null },
      },
    ]);
  });

  it('al registrar la serie emite SerieRealizada con el id del entrenamiento', () => {
    const evento = entrenamientoConRutina().registrarSerie(
      { orden: 2, numero: 3, repeticiones: 8, pesoKg: 30 },
      enCurso,
    );
    expect(evento).toMatchObject({ nombre: 'SerieRealizada', entrenamientoId: 'entrenamiento' });
  });

  it.each([
    ['serie 4 de un bloque de 3', { orden: 2, numero: 4, repeticiones: 8 }],
    ['vuelta 3 de un circuito de 2', { orden: 1, numero: 3, posicion: 1, segundos: 25 }],
    [
      'posición 3 de un circuito de 2 ejercicios',
      { orden: 1, numero: 1, posicion: 3, repeticiones: 8 },
    ],
    ['circuito sin posición', { orden: 1, numero: 1, segundos: 25 }],
    ['bloque con posición', { orden: 2, numero: 1, posicion: 1, repeticiones: 8 }],
    ['orden inexistente', { orden: 3, numero: 1, repeticiones: 8 }],
    ['segundos en un ejercicio de repeticiones', { orden: 2, numero: 1, segundos: 25 }],
    [
      'repeticiones en un ejercicio de segundos',
      { orden: 1, numero: 1, posicion: 1, repeticiones: 8 },
    ],
    ['sin medida', { orden: 2, numero: 1 }],
    ['peso negativo', { orden: 2, numero: 1, repeticiones: 8, pesoKg: -1 }],
  ])('rechaza %s con RN-ENT-03', (_caso, registro) => {
    expect(codigoDelError(() => entrenamientoConRutina().registrarSerie(registro, enCurso))).toBe(
      'RN-ENT-03',
    );
  });

  it('acepta 0 repeticiones', () => {
    const entrenamiento = entrenamientoConRutina();
    entrenamiento.registrarSerie({ orden: 2, numero: 1, repeticiones: 0 }, enCurso);
    expect(entrenamiento.datos.series[0].realizada.repeticiones).toBe(0);
  });

  it('rechaza −1 repetición con RN-ENT-03', () => {
    expect(
      codigoDelError(() =>
        entrenamientoConRutina().registrarSerie({ orden: 2, numero: 1, repeticiones: -1 }, enCurso),
      ),
    ).toBe('RN-ENT-03');
  });

  it('registrar de nuevo la misma serie con 9 reps reemplaza la de 8', () => {
    const entrenamiento = entrenamientoConRutina();
    entrenamiento.registrarSerie({ orden: 2, numero: 3, repeticiones: 8 }, enCurso);
    entrenamiento.registrarSerie({ orden: 2, numero: 3, repeticiones: 9 }, enCurso);
    expect(entrenamiento.datos.series.map((serie) => serie.realizada.repeticiones)).toEqual([9]);
  });
});

describe('RN-ENT-20 y RN-ENT-04 · un entrenamiento abandonado no admite series', () => {
  it('con inicio el 20/11 a las 23:59 UTC, acepta una serie a las 23:59:59.999', () => {
    const entrenamiento = entrenamientoConRutina();
    entrenamiento.registrarSerie(
      { orden: 2, numero: 1, repeticiones: 8 },
      new Date('2026-11-20T23:59:59.999Z'),
    );
    expect(entrenamiento.datos.series).toHaveLength(1);
  });

  it('con inicio el 20/11 a las 23:59 UTC, rechaza una serie a las 00:00 del 21/11 con RN-ENT-20', () => {
    expect(
      codigoDelError(() =>
        entrenamientoConRutina().registrarSerie(
          { orden: 2, numero: 1, repeticiones: 8 },
          new Date('2026-11-21T00:00:00.000Z'),
        ),
      ),
    ).toBe('RN-ENT-20');
  });
});
