import type { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { RecordPersonal } from '../../../src/modulos/entrenamiento/dominio/record-personal/record-personal.entidad.js';
import { RepositorioRecords } from '../../../src/modulos/entrenamiento/dominio/record-personal/repositorio-records.puerto.js';
import type { TipoRecord } from '../../../src/modulos/entrenamiento/dominio/record-personal/tipo-record.js';

const ALUMNO = '00000000-0000-4000-8000-000000000001';
const OTRO_ALUMNO = '00000000-0000-4000-8000-000000000002';
const EJERCICIO = '00000000-0000-4000-8000-000000000003';
const OTRO_EJERCICIO = '00000000-0000-4000-8000-000000000004';
const ENTRENAMIENTO = '00000000-0000-4000-8000-000000000005';
const REP = '00000000-0000-4000-8000-000000000006';
const VOL = '00000000-0000-4000-8000-000000000007';
const UNO_RM = '00000000-0000-4000-8000-000000000008';

function record(
  tipo: TipoRecord,
  valor: number,
  id: string,
  alumnoId = ALUMNO,
  ejercicioId = EJERCICIO,
): RecordPersonal {
  return RecordPersonal.reconstruir({
    id,
    alumnoId,
    ejercicioId,
    tipo,
    valor,
    entrenamientoId: ENTRENAMIENTO,
    fecha: '2026-11-22',
  });
}

describe('RN-ENT-13 · persistencia de récords contra la base de test', () => {
  let app: INestApplicationContext;
  let repositorio: RepositorioRecords;
  let conexion: DataSource;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] }).compile();
    app = await modulo.init();
    repositorio = app.get(RepositorioRecords);
    conexion = app.get(DataSource);
  });

  beforeEach(async () => {
    await conexion.query('DELETE FROM records_personales');
  });

  afterAll(async () => {
    await conexion.query('DELETE FROM records_personales');
    await app.close();
  });

  it('guarda y busca por alumno y ejercicio', async () => {
    await repositorio.guardar([
      record('repeticiones', 8, REP),
      record('volumen', 240, VOL),
      record('1rm', 38, UNO_RM),
    ]);

    const encontrados = await repositorio.buscarPorAlumnoYEjercicios(ALUMNO, [EJERCICIO]);

    expect(encontrados.map((r) => [r.datos.tipo, r.datos.valor]).sort()).toEqual([
      ['1rm', 38],
      ['repeticiones', 8],
      ['volumen', 240],
    ]);
  });

  it('actualiza el récord existente sin duplicarlo y conserva el id', async () => {
    await repositorio.guardar([
      record('repeticiones', 8, REP),
      record('volumen', 240, VOL),
      record('1rm', 38, UNO_RM),
    ]);

    await repositorio.guardar([record('repeticiones', 10, REP)]);

    const encontrados = await repositorio.buscarPorAlumnoYEjercicios(ALUMNO, [EJERCICIO]);
    const repeticiones = encontrados.find((r) => r.datos.tipo === 'repeticiones');
    expect(encontrados).toHaveLength(3);
    expect(repeticiones?.datos).toMatchObject({ id: REP, valor: 10 });
  });

  it('filtra por alumno y por ejercicio', async () => {
    await repositorio.guardar([
      record('repeticiones', 8, REP),
      record('repeticiones', 9, VOL, OTRO_ALUMNO),
      record('repeticiones', 10, UNO_RM, ALUMNO, OTRO_EJERCICIO),
    ]);

    const encontrados = await repositorio.buscarPorAlumnoYEjercicios(ALUMNO, [EJERCICIO]);

    expect(encontrados).toHaveLength(1);
    expect(encontrados[0].datos).toMatchObject({ alumnoId: ALUMNO, ejercicioId: EJERCICIO });
  });

  it('no consulta ni guarda listas vacías', async () => {
    expect(await repositorio.buscarPorAlumnoYEjercicios(ALUMNO, [])).toEqual([]);
    await expect(repositorio.guardar([])).resolves.toBeUndefined();
    expect(await repositorio.buscarPorAlumnoYEjercicios(ALUMNO, [EJERCICIO])).toEqual([]);
  });
});
