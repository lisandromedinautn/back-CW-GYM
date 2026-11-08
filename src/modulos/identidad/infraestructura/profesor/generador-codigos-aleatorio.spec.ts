import { describe, expect, it } from 'vitest';
import { GeneradorCodigosAleatorio } from './generador-codigos-aleatorio.js';

describe('RN-IDE-08 · el código de profesor tiene 6 caracteres de ABCDEFGHJKLMNPQRSTUVWXYZ23456789', () => {
  it('100 códigos generados cumplen el formato (sin 0, O, 1 ni I)', () => {
    const generador = new GeneradorCodigosAleatorio();

    const codigos = Array.from({ length: 100 }, () => generador.generar());

    expect(codigos.filter((c) => !/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(c))).toEqual([]);
  });
});
