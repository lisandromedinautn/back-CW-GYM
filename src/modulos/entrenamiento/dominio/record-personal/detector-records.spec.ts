import { describe, expect, it } from 'vitest';
import { DetectorRecords } from './detector-records.js';
import { RecordPersonal } from './record-personal.entidad.js';
import type { TipoRecord } from './tipo-record.js';

const contexto = {
  alumnoId: 'alumno-1',
  entrenamientoId: 'entrenamiento-2',
  fecha: '2026-11-22',
};

function record(tipo: TipoRecord, valor: number, ejercicioId = 'sentadilla'): RecordPersonal {
  return RecordPersonal.reconstruir({
    id: `${ejercicioId}-${tipo}`,
    alumnoId: 'alumno-1',
    ejercicioId,
    tipo,
    valor,
    entrenamientoId: 'entrenamiento-1',
    fecha: '2026-11-20',
  });
}

describe('RN-ENT-13 · detección de récords personales', () => {
  it('guarda la primera marca sin emitir evento', () => {
    const { guardados, batidos } = new DetectorRecords().detectar(
      [{ ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 100 }],
      [],
      contexto,
    );

    expect(guardados).toHaveLength(1);
    expect(guardados[0].datos.valor).toBe(100);
    expect(batidos).toHaveLength(0);
  });

  it('no guarda ni emite cuando la marca empata', () => {
    const { guardados, batidos } = new DetectorRecords().detectar(
      [{ ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 100 }],
      [record('repeticiones', 100)],
      contexto,
    );

    expect(guardados).toHaveLength(0);
    expect(batidos).toHaveLength(0);
  });

  it('guarda la marca mayor y emite el récord batido', () => {
    const { guardados, batidos } = new DetectorRecords().detectar(
      [{ ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 101 }],
      [record('repeticiones', 100)],
      contexto,
    );

    expect(guardados).toHaveLength(1);
    expect(guardados[0].datos.valor).toBe(101);
    expect(batidos).toHaveLength(1);
    expect(batidos[0]).toMatchObject({
      nombre: 'RecordBatido',
      alumnoId: 'alumno-1',
      ejercicioId: 'sentadilla',
      tipo: 'repeticiones',
      valorAnterior: 100,
      valorNuevo: 101,
      entrenamientoId: 'entrenamiento-2',
    });
  });

  it('detecta cada tipo de récord por separado', () => {
    const { guardados, batidos } = new DetectorRecords().detectar(
      [
        { ejercicioId: 'sentadilla', tipo: 'repeticiones', valor: 5 },
        { ejercicioId: 'sentadilla', tipo: 'volumen', valor: 360 },
        { ejercicioId: 'sentadilla', tipo: '1rm', valor: 84 },
      ],
      [record('repeticiones', 5), record('volumen', 300), record('1rm', 70)],
      contexto,
    );

    expect(guardados.map((r) => [r.datos.tipo, r.datos.valor])).toEqual([
      ['volumen', 360],
      ['1rm', 84],
    ]);
    expect(batidos).toHaveLength(2);
    expect(batidos.map((e) => [e.tipo, e.valorAnterior, e.valorNuevo])).toEqual([
      ['volumen', 300, 360],
      ['1rm', 70, 84],
    ]);
  });
});
