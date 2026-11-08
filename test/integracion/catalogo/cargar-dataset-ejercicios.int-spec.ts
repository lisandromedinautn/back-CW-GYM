import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios.caso-uso.js';
import { ListarEjercicios } from '../../../src/modulos/catalogo/aplicacion/listar-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/fuente-dataset-ejercicios.archivo.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';

describe('Carga del dataset de ejercicios contra la base de test', () => {
  let modulo: TestingModule;
  let cargar: CargarDatasetEjercicios;
  let listar: ListarEjercicios;
  let conexion: DataSource;

  beforeAll(async () => {
    modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    await modulo.init();
    cargar = modulo.get(CargarDatasetEjercicios);
    listar = modulo.get(ListarEjercicios);
    conexion = modulo.get(DataSource);
  });

  beforeEach(async () => {
    await conexion.query('DELETE FROM ejercicios');
  });

  afterAll(async () => {
    await conexion.query('DELETE FROM ejercicios');
    await modulo.close();
  });

  describe('RN-CAT-07 · el nombre es único: si el dataset lo repite, queda el primero del archivo', () => {
    it('el fixture de 5 registros con "lever chest press" repetido deja 4 ejercicios y el 0577', async () => {
      await cargar.ejecutar();

      const ejercicios = await listar.ejecutar();
      const ids = ejercicios.map((e) => e.idDataset).sort();
      expect(ids).toEqual(['0001', '0535', '0577', '2135']);
    });
  });

  describe('RN-CAT-09 · la carga es idempotente: un id de dataset existente no se duplica', () => {
    it('cargar dos veces el fixture deja 4 ejercicios', async () => {
      await cargar.ejecutar();
      await cargar.ejecutar();

      expect(await listar.ejecutar()).toHaveLength(4);
    });
  });
});
