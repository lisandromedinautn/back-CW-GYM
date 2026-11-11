import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { NombreRutina } from './nombre-rutina.valor.js';
import type { EjercicioDelCatalogo } from './ejercicio-del-catalogo.js';
import { type DatosBloque, Rutina } from './rutina.entidad.js';

// Ejercicio del fixture (test/datasets/ejercicios-fixture.json), como lo ve planificación.
const PRESS_PECHO: EjercicioDelCatalogo = {
  id: 'lever-chest-press',
  porTiempo: false,
  admitePesoExtra: true, // Peso Extra
};

const bloque = (cambios: Partial<DatosBloque> = {}): DatosBloque => ({
  ejercicio: PRESS_PECHO,
  series: 3,
  micropausaSegundos: 60,
  macropausaSegundos: 120,
  repeticiones: 10,
  ...cambios,
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

describe('RN-PLAN-21 · la rutina tiene un nombre de 1 a 60 caracteres, sin contar los espacios de los extremos', () => {
  it("'  Pecho y espalda  ' se guarda recortado como 'Pecho y espalda'", () => {
    expect(NombreRutina.crear('  Pecho y espalda  ').valor).toBe('Pecho y espalda');
  });

  it("un nombre de 60 caracteres ('a' repetida 60 veces) se acepta", () => {
    expect(NombreRutina.crear('a'.repeat(60)).valor).toBe('a'.repeat(60));
  });

  it("un nombre de 61 caracteres ('a' repetida 61 veces) se rechaza con RN-PLAN-21", () => {
    expect(codigoDelError(() => NombreRutina.crear('a'.repeat(61)))).toBe('RN-PLAN-21');
  });

  it("un nombre de solo espacios ('   ') se rechaza con RN-PLAN-21", () => {
    expect(codigoDelError(() => NombreRutina.crear('   '))).toBe('RN-PLAN-21');
  });
});

describe('RN-PLAN-21 · renombrar la rutina valida el nombre nuevo con la misma regla', () => {
  it("renombrar la rutina a 'Piernas' deja el nombre 'Piernas'", () => {
    const rutina = Rutina.crear({ profesorUsuarioId: 'u-laura', bloques: [bloque()] });

    rutina.renombrar('Piernas');

    expect(rutina.nombre).toBe('Piernas');
  });

  it("renombrar la rutina a '' se rechaza con RN-PLAN-21", () => {
    const rutina = Rutina.crear({ profesorUsuarioId: 'u-laura', bloques: [bloque()] });

    expect(codigoDelError(() => rutina.renombrar(''))).toBe('RN-PLAN-21');
  });
});
