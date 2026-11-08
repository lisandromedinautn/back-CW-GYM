import { describe, expect, it } from 'vitest';
import type { Ejercicio } from '../dominio/ejercicio.entidad.js';
import { FuenteDatasetEjercicios } from '../dominio/fuente-dataset-ejercicios.puerto.js';
import type { RegistroDataset } from '../dominio/registro-dataset.js';
import { RepositorioEjercicios } from '../dominio/repositorio-ejercicios.puerto.js';
import { CargarDatasetEjercicios } from './cargar-dataset-ejercicios.caso-uso.js';

class RepositorioEnMemoria extends RepositorioEjercicios {
  readonly guardados: Ejercicio[] = [];
  async guardar(ejercicio: Ejercicio): Promise<void> {
    this.guardados.push(ejercicio);
  }
  async existePorIdDataset(idDataset: string): Promise<boolean> {
    return this.guardados.some((e) => e.idDataset === idDataset);
  }
  async existePorNombre(nombre: string): Promise<boolean> {
    return this.guardados.some((e) => e.nombre === nombre);
  }
  async listar(): Promise<Ejercicio[]> {
    return [...this.guardados];
  }
}

class FuenteFalsa extends FuenteDatasetEjercicios {
  constructor(private readonly registros: RegistroDataset[]) {
    super();
  }
  async leer(): Promise<RegistroDataset[]> {
    return this.registros;
  }
}

const registro = (id: string, name: string): RegistroDataset => ({
  id,
  name,
  category: 'chest',
  equipment: 'leverage machine',
  target: 'pectorals',
  secondary_muscles: [],
  instrucciones: `Instrucciones del ejercicio ${id}.`,
  gif_url: `videos/${id}.gif`,
  attribution: '© Gym visual — https://gymvisual.com/',
});

describe('RN-CAT-07 · el nombre es único: si el dataset lo repite, queda el primero del archivo', () => {
  it('con "lever chest press" en los ids 0577 y 0576, queda el 0577', async () => {
    const repositorio = new RepositorioEnMemoria();
    const fuente = new FuenteFalsa([
      registro('0577', 'lever chest press'),
      registro('0001', '3/4 sit-up'),
      registro('0576', 'lever chest press'),
    ]);

    await new CargarDatasetEjercicios(fuente, repositorio).ejecutar();

    const ids = (await repositorio.listar()).map((e) => e.idDataset);
    expect(ids).toEqual(['0577', '0001']);
  });
});

describe('RN-CAT-09 · la carga es idempotente: un id de dataset existente no se duplica', () => {
  it('cargar dos veces el mismo dataset deja 2 ejercicios', async () => {
    const repositorio = new RepositorioEnMemoria();
    const caso = new CargarDatasetEjercicios(
      new FuenteFalsa([registro('0577', 'lever chest press'), registro('0001', '3/4 sit-up')]),
      repositorio,
    );

    await caso.ejecutar();
    await caso.ejecutar();

    expect(await repositorio.listar()).toHaveLength(2);
  });

  it('un registro con un id ya cargado no se duplica ni modifica el ejercicio existente', async () => {
    const repositorio = new RepositorioEnMemoria();
    await new CargarDatasetEjercicios(
      new FuenteFalsa([registro('0001', 'sit-up cargado antes')]),
      repositorio,
    ).ejecutar();

    await new CargarDatasetEjercicios(
      new FuenteFalsa([registro('0001', '3/4 sit-up')]),
      repositorio,
    ).ejecutar();

    expect((await repositorio.listar()).map((e) => e.nombre)).toEqual(['sit-up cargado antes']);
  });
});
