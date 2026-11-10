import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { DatosCircuito, DatosEjercicioCircuito } from './circuito.entidad.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';
import { Rutina } from './rutina.entidad.js';

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

const press = (cambios: Partial<DatosEjercicioCircuito> = {}): DatosEjercicioCircuito => ({
  ejercicio: PRESS_PECHO,
  repeticiones: 10,
  ...cambios,
});
const plancha = (cambios: Partial<DatosEjercicioCircuito> = {}): DatosEjercicioCircuito => ({
  ejercicio: PLANCHA,
  segundos: 45,
  ...cambios,
});

const circuito = (cambios: Partial<DatosCircuito> = {}): DatosCircuito => ({
  ejercicios: [press(), plancha()],
  vueltas: 3,
  macropausaSegundos: 90,
  ...cambios,
});

const crear = (...circuitos: DatosCircuito[]) =>
  Rutina.crear({ profesorUsuarioId: 'u-laura', bloques: [], circuitos });

const codigoDelError = (accion: () => unknown): string | undefined => {
  try {
    accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

describe('RN-PLAN-03 · un circuito tiene 2 o más ejercicios; cada vuelta es una serie y termina con macropausa', () => {
  it('lever chest press (10 reps) y weighted front plank (45 s), 3 vueltas: 2 ejercicios en ese orden', () => {
    const [primero] = crear(circuito()).circuitos;

    expect([primero?.ejercicios.map((e) => e.ejercicioId), primero?.vueltas]).toEqual([
      ['lever-chest-press', 'weighted-front-plank'],
      3,
    ]);
  });

  it('con un solo ejercicio se rechaza con RN-PLAN-03', () => {
    expect(codigoDelError(() => crear(circuito({ ejercicios: [press()] })))).toBe('RN-PLAN-03');
  });

  it('con 0 vueltas se rechaza con RN-PLAN-03', () => {
    expect(codigoDelError(() => crear(circuito({ vueltas: 0 })))).toBe('RN-PLAN-03');
  });

  it('la macropausa de 90 s queda guardada', () => {
    expect(crear(circuito({ macropausaSegundos: 90 })).circuitos[0]?.macropausa.segundos).toBe(90);
  });
});

describe('RN-PLAN-04 · en el circuito, por tiempo no lleva repeticiones', () => {
  it('weighted front plank con 12 repeticiones se rechaza con RN-PLAN-04', () => {
    const conRepeticiones = plancha({ segundos: null, repeticiones: 12 });

    expect(codigoDelError(() => crear(circuito({ ejercicios: [press(), conRepeticiones] })))).toBe(
      'RN-PLAN-04',
    );
  });
});

describe('RN-PLAN-05 · en el circuito, el peso solo va si la carga incluye Peso Extra', () => {
  it('3/4 sit-up (Peso Corporal) con 5 kg se rechaza con RN-PLAN-05', () => {
    const sitUpConPeso: DatosEjercicioCircuito = {
      ejercicio: ABDOMINALES,
      repeticiones: 15,
      pesoKg: 5,
    };

    expect(codigoDelError(() => crear(circuito({ ejercicios: [press(), sitUpConPeso] })))).toBe(
      'RN-PLAN-05',
    );
  });
});

describe('RN-PLAN-20 · un circuito no repite ejercicios', () => {
  it('press, plancha y press se rechaza con RN-PLAN-20', () => {
    expect(
      codigoDelError(() => crear(circuito({ ejercicios: [press(), plancha(), press()] }))),
    ).toBe('RN-PLAN-20');
  });
});

describe('RN-PLAN-01 · el tipo de rutina se deriva de su contenido', () => {
  it('solo circuitos: la rutina es de Circuitos', () => {
    expect(crear(circuito()).tipo.valor).toBe('Circuitos');
  });

  it('sin bloques ni circuitos se rechaza con RN-PLAN-01', () => {
    expect(codigoDelError(() => crear())).toBe('RN-PLAN-01');
  });
});
