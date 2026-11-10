import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';
import { type DatosBloque, Rutina } from './rutina.entidad.js';

// Ejercicios del fixture (test/datasets/ejercicios-fixture.json), como los ve planificación.
const PRESS_PECHO: EjercicioDelCatalogo = {
  id: 'lever-chest-press',
  porTiempo: false,
  admitePesoExtra: true, // Peso Extra
};
const PLANCHA: EjercicioDelCatalogo = {
  id: 'weighted-front-plank',
  porTiempo: true,
  admitePesoExtra: true, // Peso Corporal + Peso Extra
};
const ABDOMINALES: EjercicioDelCatalogo = {
  id: '3-4-sit-up',
  porTiempo: false,
  admitePesoExtra: false, // Peso Corporal
};

const bloque = (cambios: Partial<DatosBloque> = {}): DatosBloque => ({
  ejercicio: PRESS_PECHO,
  series: 3,
  micropausaSegundos: 60,
  macropausaSegundos: 120,
  repeticiones: 10,
  ...cambios,
});

const crear = (...bloques: DatosBloque[]) =>
  Rutina.crear({ profesorUsuarioId: 'u-laura', bloques });

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

describe('RN-PLAN-01 · una rutina es una secuencia ordenada de bloques, con al menos uno; el tipo se deriva', () => {
  it('con un bloque de lever chest press la rutina es de Bloques', () => {
    expect(crear(bloque()).tipo.valor).toBe('Bloques');
  });

  it('sin bloques se rechaza con RN-PLAN-01', () => {
    expect(codigoDelError(() => crear())).toBe('RN-PLAN-01');
  });

  it('dos bloques (lever chest press, weighted front plank) respetan el orden dado', () => {
    const rutina = crear(
      bloque(),
      bloque({ ejercicio: PLANCHA, repeticiones: null, segundos: 45 }),
    );

    expect(rutina.bloques.map((b) => b.ejercicio.ejercicioId)).toEqual([
      'lever-chest-press',
      'weighted-front-plank',
    ]);
  });
});

describe('RN-PLAN-02 · un bloque tiene N series (N ≥ 1), una micropausa y una macropausa', () => {
  it('con 1 serie el bloque se crea', () => {
    expect(crear(bloque({ series: 1 })).bloques[0]?.series).toBe(1);
  });

  it('con 0 series se rechaza con RN-PLAN-02', () => {
    expect(codigoDelError(() => crear(bloque({ series: 0 })))).toBe('RN-PLAN-02');
  });

  it('la micropausa de 60 s y la macropausa de 120 s quedan guardadas', () => {
    const [primero] = crear(bloque({ micropausaSegundos: 60, macropausaSegundos: 120 })).bloques;

    expect([primero?.micropausa.segundos, primero?.macropausa.segundos]).toEqual([60, 120]);
  });
});

describe('RN-PLAN-04 · por repeticiones no lleva tiempo y por tiempo no lleva repeticiones', () => {
  it('lever chest press (por repeticiones) con 10 repeticiones se acepta', () => {
    const { objetivo } = crear(bloque({ repeticiones: 10 })).bloques[0]!.ejercicio;

    expect([objetivo.repeticiones, objetivo.segundos]).toEqual([10, null]);
  });

  it('lever chest press con 30 segundos se rechaza con RN-PLAN-04', () => {
    expect(codigoDelError(() => crear(bloque({ repeticiones: null, segundos: 30 })))).toBe(
      'RN-PLAN-04',
    );
  });

  it('weighted front plank (por tiempo) con 45 segundos se acepta', () => {
    const { objetivo } = crear(bloque({ ejercicio: PLANCHA, repeticiones: null, segundos: 45 }))
      .bloques[0]!.ejercicio;

    expect([objetivo.segundos, objetivo.repeticiones]).toEqual([45, null]);
  });

  it('weighted front plank con 12 repeticiones se rechaza con RN-PLAN-04', () => {
    expect(codigoDelError(() => crear(bloque({ ejercicio: PLANCHA, repeticiones: 12 })))).toBe(
      'RN-PLAN-04',
    );
  });
});

describe('RN-PLAN-05 · el peso se indica solo si el tipo de carga incluye Peso Extra', () => {
  it('lever chest press (Peso Extra) con 40 kg se acepta', () => {
    expect(crear(bloque({ pesoKg: 40 })).bloques[0]?.ejercicio.objetivo.pesoKg).toBe(40);
  });

  it('weighted front plank (Peso Corporal + Peso Extra) con 10 kg se acepta', () => {
    const rutina = crear(
      bloque({ ejercicio: PLANCHA, repeticiones: null, segundos: 45, pesoKg: 10 }),
    );

    expect(rutina.bloques[0]?.ejercicio.objetivo.pesoKg).toBe(10);
  });

  it('3/4 sit-up (Peso Corporal) con 5 kg se rechaza con RN-PLAN-05', () => {
    expect(codigoDelError(() => crear(bloque({ ejercicio: ABDOMINALES, pesoKg: 5 })))).toBe(
      'RN-PLAN-05',
    );
  });
});
