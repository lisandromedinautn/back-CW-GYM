import { describe, expect, it } from 'vitest';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Gravedad } from './gravedad.valor.js';
import { Percepcion } from './percepcion.valor.js';

describe('RN-NOT-02 · la gravedad es Grave desde el 40% de series por debajo, Leve antes', () => {
  it('1 de 10 → leve', () => {
    expect(Gravedad.desde(1, 10).valor).toBe('leve');
  });

  it('3 de 8 (37,5%) → leve', () => {
    expect(Gravedad.desde(3, 8).valor).toBe('leve');
  });

  it('2 de 5 (40%) → grave', () => {
    expect(Gravedad.desde(2, 5).valor).toBe('grave');
  });

  it('1 de 2 (50%) → grave', () => {
    expect(Gravedad.desde(1, 2).valor).toBe('grave');
  });

  it('5 de 5 (sin registrar ninguna serie) → grave', () => {
    expect(Gravedad.desde(5, 5).valor).toBe('grave');
  });

  it('cantidades inválidas (0 de 5, 6 de 5 y 0 de 0) → RN-NOT-02', () => {
    const codigos = [
      () => Gravedad.desde(0, 5),
      () => Gravedad.desde(6, 5),
      () => Gravedad.desde(0, 0),
    ].map((f) => {
      try {
        f();
        return 'sin error';
      } catch (e) {
        return e instanceof ErrorDominio ? e.codigo : 'otro error';
      }
    });
    expect(codigos).toEqual(['RN-NOT-02', 'RN-NOT-02', 'RN-NOT-02']);
  });
});

describe('RN-NOT-06 · la gravedad de la percepción es Leve con una condición y Grave con las dos', () => {
  it('9/3, 7/2, 10/1 y 8/3 → Leve, Leve, Grave y null', () => {
    const resultado = [
      Gravedad.dePercepcion(Percepcion.crear({ rpe: 9, sensacionFuerza: 3 }))?.valor ?? null,
      Gravedad.dePercepcion(Percepcion.crear({ rpe: 7, sensacionFuerza: 2 }))?.valor ?? null,
      Gravedad.dePercepcion(Percepcion.crear({ rpe: 10, sensacionFuerza: 1 }))?.valor ?? null,
      Gravedad.dePercepcion(Percepcion.crear({ rpe: 8, sensacionFuerza: 3 }))?.valor ?? null,
    ];
    expect(resultado).toEqual(['leve', 'leve', 'grave', null]);
  });
});

describe('RN-NOT-07 · queda la mayor gravedad entre las series y la percepción', () => {
  it('Leve y Grave → Grave; Leve y Leve → Leve; Grave y Leve → Grave; Leve y null → Leve', () => {
    const leve = Gravedad.desde(1, 10);
    const grave = Gravedad.desde(5, 5);
    const resultado = [
      Gravedad.mayor(leve, grave).valor,
      Gravedad.mayor(leve, leve).valor,
      Gravedad.mayor(grave, leve).valor,
      Gravedad.mayor(leve, null).valor,
    ];
    expect(resultado).toEqual(['grave', 'leve', 'grave', 'leve']);
  });
});
