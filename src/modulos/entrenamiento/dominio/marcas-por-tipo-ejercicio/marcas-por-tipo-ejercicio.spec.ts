import { describe, expect, it } from 'vitest';
import type { SerieRealizada } from '../entrenamiento/serie-realizada.valor.js';
import type { EjercicioParaRecords } from './ejercicio-para-records.js';
import { MarcasPorTipoEjercicio } from './marcas-por-tipo-ejercicio.js';
import type { SerieParaRecords } from './serie-para-records.js';

function serie(params: {
  repeticiones?: number | null;
  segundos?: number | null;
  pesoKg?: number | null;
}): SerieRealizada {
  const medida = {
    repeticiones: params.repeticiones ?? null,
    segundos: params.segundos ?? null,
    pesoKg: params.pesoKg ?? null,
  };
  return {
    orden: 1,
    numero: 1,
    posicion: null,
    ejercicioId: 'sentadilla',
    nombre: 'Sentadilla',
    prescripta: medida,
    realizada: medida,
  };
}

function ejercicio(params: Partial<EjercicioParaRecords> = {}): EjercicioParaRecords {
  return {
    id: 'sentadilla',
    tipo: 'por repeticiones',
    tipoCarga: 'Peso Extra',
    factorPesoCorporal: 100,
    ...params,
  };
}

function marcasDe(entrada: Omit<SerieParaRecords, 'pesoCorporalKg'>, pesoCorporalKg = 80) {
  return new MarcasPorTipoEjercicio().marcasDe({
    ...entrada,
    pesoCorporalKg,
  });
}

describe('RN-ENT-10 · marcas según el tipo de ejercicio', () => {
  it('repeticiones con carga generan repeticiones, volumen y 1RM', () => {
    expect(
      marcasDe({
        serie: serie({ repeticiones: 5, pesoKg: 60 }),
        ejercicio: ejercicio({ tipoCarga: 'Peso Extra' }),
      }),
    ).toEqual([
      { ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 5 },
      { ejercicioId: 'sentadilla', tipo: 'volumen', valor: 300 },
      { ejercicioId: 'sentadilla', tipo: '1rm', valor: 70 },
    ]);
  });

  it('repeticiones sin peso solo generan repeticiones', () => {
    expect(
      marcasDe({
        serie: serie({ repeticiones: 15 }),
        ejercicio: ejercicio({ tipoCarga: 'Sin Peso' }),
      }),
    ).toEqual([{ ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 15 }]);
  });

  it('ejercicios por tiempo generan tiempo', () => {
    expect(
      marcasDe({
        serie: serie({ segundos: 60 }),
        ejercicio: ejercicio({ tipo: 'por tiempo', tipoCarga: 'Sin Peso' }),
      }),
    ).toEqual([{ ejercicioId: 'sentadilla', tipo: 'tiempo', valor: 60 }]);
  });

  it('peso corporal usa el peso del alumno', () => {
    expect(
      marcasDe({
        serie: serie({ repeticiones: 3 }),
        ejercicio: ejercicio({
          tipoCarga: 'Peso Corporal',
          factorPesoCorporal: 100,
        }),
      }),
    ).toEqual([
      { ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 3 },
      { ejercicioId: 'sentadilla', tipo: 'volumen', valor: 240 },
      { ejercicioId: 'sentadilla', tipo: '1rm', valor: 88 },
    ]);
  });
});
