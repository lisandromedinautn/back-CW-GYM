import { describe, expect, it } from 'vitest';
import { CargaEfectiva } from '../carga-efectiva/carga-efectiva.valor.js';
import { VolumenSerie } from './volumen-serie.valor.js';

describe('RN-ENT-06, RN-ENT-12 · volumen de serie', () => {
  it('multiplica la carga efectiva por las repeticiones', () => {
    const carga = CargaEfectiva.calcular({
      tipoCarga: 'Peso Corporal + Peso Extra',
      pesoCorporalKg: 80,
      factorPesoCorporal: 100,
      pesoExtraKg: 10,
    });

    expect(VolumenSerie.calcular(carga, 6).kg).toBe(540);
  });
});
