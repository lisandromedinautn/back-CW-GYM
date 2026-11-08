import { describe, expect, it } from 'vitest';
import { Ejercicio } from './ejercicio.js';
import { Musculo } from './musculo.js';
import { TipoCarga } from './tipo-carga.js';
import { TipoEjercicio } from './tipo-ejercicio.js';

const datosValidos = {
  idDataset: '0001',
  nombre: '3/4 sit-up',
  descripcion: 'Acostate boca arriba con las rodillas flexionadas.',
  tipo: TipoEjercicio.POR_REPETICIONES,
  tipoCarga: TipoCarga.PESO_CORPORAL,
  musculoPrincipal: Musculo.desde('Abdominales'),
  urlGif: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0001.gif',
  atribucion: '© Gym visual — https://gymvisual.com/',
};

describe('RN-CAT-01 · todo ejercicio tiene nombre, descripción, tipo, carga y músculo principal; el secundario es opcional', () => {
  it('con nombre vacío se rechaza con RN-CAT-01', () => {
    expect(() => Ejercicio.crear({ ...datosValidos, nombre: '' })).toThrow(
      expect.objectContaining({ name: 'ErrorDominio', codigo: 'RN-CAT-01' }),
    );
  });

  it('sin músculo secundario se crea bien', () => {
    expect(Ejercicio.crear(datosValidos).musculoSecundario).toBeNull();
  });
});
