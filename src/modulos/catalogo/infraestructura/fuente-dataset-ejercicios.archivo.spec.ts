import { describe, expect, it } from 'vitest';
import { FuenteDatasetEjerciciosArchivo } from './fuente-dataset-ejercicios.archivo.js';

describe('T01 · la fuente lee los registros del archivo en el orden del origen', () => {
  it('el fixture devuelve 5 registros y el 0577 aparece antes que el 0576', async () => {
    const registros = await new FuenteDatasetEjerciciosArchivo(
      'test/datasets/ejercicios-fixture.json',
    ).leer();

    const ids = registros.map((r) => r.id);
    expect(ids).toEqual(['0001', '0535', '0577', '0576', '2135']);
  });
});
