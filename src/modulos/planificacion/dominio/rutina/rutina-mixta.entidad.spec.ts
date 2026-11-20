import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';
import { type DatosBloque, type DatosCircuito, Rutina } from './rutina.entidad.js';

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

const bloque = (cambios: Partial<DatosBloque> = {}): DatosBloque => ({
  ejercicio: PRESS_PECHO,
  series: 3,
  micropausaSegundos: 60,
  macropausaSegundos: 120,
  repeticiones: 10,
  ...cambios,
});

const circuito = (cambios: Partial<DatosCircuito> = {}): DatosCircuito => ({
  ejercicios: [
    { ejercicio: PRESS_PECHO, repeticiones: 10 },
    { ejercicio: PLANCHA, segundos: 45 },
  ],
  vueltas: 3,
  macropausaSegundos: 90,
  ...cambios,
});

const crear = (bloques: DatosBloque[], circuitos: DatosCircuito[]) =>
  Rutina.crear({ profesorUsuarioId: 'u-laura', bloques, circuitos });

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

describe('RN-PLAN-01 · una rutina mixta es una secuencia ordenada de bloques y circuitos; el tipo se deriva', () => {
  it('con 1 bloque de lever chest press y 1 circuito la rutina es Mixta', () => {
    expect(crear([bloque()], [circuito()]).tipo.valor).toBe('Mixta');
  });

  it('con el circuito en orden 1 y el bloque en orden 2 la secuencia es circuito, bloque', () => {
    const rutina = crear([bloque({ orden: 2 })], [circuito({ orden: 1 })]);

    expect(rutina.elementos.map((elemento) => elemento.tipo)).toEqual(['circuito', 'bloque']);
  });

  it('sin orden en ninguno la secuencia es bloque, circuito', () => {
    const rutina = crear([bloque()], [circuito()]);

    expect(rutina.elementos.map((elemento) => elemento.tipo)).toEqual(['bloque', 'circuito']);
  });

  it('con órdenes repetidos (1 y 1) se rechaza con RN-PLAN-01', () => {
    expect(codigoDelError(() => crear([bloque({ orden: 1 })], [circuito({ orden: 1 })]))).toBe(
      'RN-PLAN-01',
    );
  });

  it('con un hueco en los órdenes (1 y 3) se rechaza con RN-PLAN-01', () => {
    expect(codigoDelError(() => crear([bloque({ orden: 1 })], [circuito({ orden: 3 })]))).toBe(
      'RN-PLAN-01',
    );
  });

  it('con orden solo en el bloque se rechaza con RN-PLAN-01', () => {
    expect(codigoDelError(() => crear([bloque({ orden: 1 })], [circuito()]))).toBe('RN-PLAN-01');
  });
});
