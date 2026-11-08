import { describe, expect, it } from 'vitest';
import { Ejercicio } from '../dominio/ejercicio.js';
import { Musculo } from '../dominio/musculo.js';
import { RepositorioEjercicios } from '../dominio/repositorio-ejercicios.js';
import { TipoCarga } from '../dominio/tipo-carga.js';
import { TipoEjercicio } from '../dominio/tipo-ejercicio.js';
import { ListarEjercicios } from './listar-ejercicios.caso-uso.js';

const ejercicio = (idDataset: string, nombre: string): Ejercicio =>
  Ejercicio.crear({
    idDataset,
    nombre,
    descripcion: 'Descripción.',
    tipo: TipoEjercicio.POR_REPETICIONES,
    tipoCarga: TipoCarga.PESO_EXTRA,
    musculoPrincipal: Musculo.desde('Pectoral'),
    urlGif: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/x.gif',
    atribucion: '© Gym visual — https://gymvisual.com/',
  });

class RepositorioFijo extends RepositorioEjercicios {
  constructor(private readonly ejercicios: Ejercicio[]) {
    super();
  }
  async guardar(): Promise<void> {}
  async existePorIdDataset(): Promise<boolean> {
    return false;
  }
  async existePorNombre(): Promise<boolean> {
    return false;
  }
  async listar(): Promise<Ejercicio[]> {
    return this.ejercicios;
  }
}

describe('T01 · listar-ejercicios devuelve el catálogo en orden alfabético por nombre', () => {
  it('con "squat", "bench press" y "curl" devuelve bench press, curl, squat', async () => {
    const caso = new ListarEjercicios(
      new RepositorioFijo([
        ejercicio('3', 'squat'),
        ejercicio('1', 'bench press'),
        ejercicio('2', 'curl'),
      ]),
    );

    const nombres = (await caso.ejecutar()).map((e) => e.nombre);

    expect(nombres).toEqual(['bench press', 'curl', 'squat']);
  });
});
