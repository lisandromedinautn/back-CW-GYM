import { describe, expect, it } from 'vitest';
import { CargaEfectiva } from '../carga-efectiva/carga-efectiva.valor.js';
import { UnoRMEstimado } from './uno-rm-estimado.valor.js';

function cargaDe(kg: number): CargaEfectiva {
  return CargaEfectiva.calcular({
    tipoCarga: 'Peso Extra',
    pesoCorporalKg: 80,
    factorPesoCorporal: 100,
    pesoExtraKg: kg,
  });
}

describe('RN-ENT-12 · ejemplo de referencia', () => {
  it('estima 108 kg para 90 kg y 6 repeticiones', () => {
    expect(UnoRMEstimado.calcular(cargaDe(90), 6)?.kg).toBe(108);
  });
});

describe('RN-ENT-11 · solo entre 1 y 10 repeticiones', () => {
  it('estima 80 kg en el límite de 10 repeticiones', () => {
    expect(UnoRMEstimado.calcular(cargaDe(60), 10)?.kg).toBe(80);
  });

  it('no estima con 11 repeticiones', () => {
    expect(UnoRMEstimado.calcular(cargaDe(60), 11)).toBeNull();
  });

  it('no estima sin repeticiones', () => {
    expect(UnoRMEstimado.calcular(cargaDe(60), 0)).toBeNull();
  });
});
