import { describe, expect, it } from 'vitest';
import { CargaEfectiva } from './carga-efectiva.valor.js';

const datos = {
  pesoCorporalKg: 80,
  factorPesoCorporal: 100,
  pesoExtraKg: 10,
};

describe('RN-ENT-07 · carga efectiva por tipo de carga', () => {
  it('Sin Peso no suma carga', () => {
    const carga = CargaEfectiva.calcular({ ...datos, tipoCarga: 'Sin Peso' });
    expect(carga.kg).toBe(0);
  });

  it('Peso Extra usa el peso extra', () => {
    const carga = CargaEfectiva.calcular({ ...datos, tipoCarga: 'Peso Extra' });
    expect(carga.kg).toBe(10);
  });

  it('Peso Corporal usa el peso corporal por el factor', () => {
    const carga = CargaEfectiva.calcular({
      ...datos,
      tipoCarga: 'Peso Corporal',
      factorPesoCorporal: 64,
    });
    expect(carga.kg).toBe(51.2);
  });
});

describe('RN-ENT-12 · ejemplo de referencia', () => {
  it('Peso Corporal + Peso Extra suma ambos', () => {
    const carga = CargaEfectiva.calcular({
      ...datos,
      tipoCarga: 'Peso Corporal + Peso Extra',
    });
    expect(carga.kg).toBe(90);
  });
});
