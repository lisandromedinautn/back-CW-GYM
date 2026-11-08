import { describe, expect, it } from 'vitest';
import { mapearRegistroDataset } from './mapear-registro-dataset.js';
import type { RegistroDataset } from './registro-dataset.js';

const registro = (cambios: Partial<RegistroDataset> = {}): RegistroDataset => ({
  id: '0001',
  name: '3/4 sit-up',
  category: 'waist',
  equipment: 'body weight',
  target: 'abs',
  secondary_muscles: [],
  instrucciones: 'Acostate boca arriba con las rodillas flexionadas.',
  gif_url: 'videos/0001-2gPfomN.gif',
  attribution: '© Gym visual — https://gymvisual.com/',
  ...cambios,
});

describe('RN-CAT-08 · cada registro del dataset se traduce al modelo según el mapeo', () => {
  it.each([
    ['body weight', 'Peso Corporal'],
    ['weighted', 'Peso Corporal + Peso Extra'],
    ['stationary bike', 'Sin Peso'],
    ['barbell', 'Peso Extra'],
  ])('con equipment %s el tipo de carga es %s', (equipment, esperado) => {
    expect(mapearRegistroDataset(registro({ equipment })).tipoCarga.valor).toBe(esperado);
  });

  it('con category cardio el tipo es por tiempo', () => {
    const ejercicio = mapearRegistroDataset(registro({ category: 'cardio' }));
    expect(ejercicio.tipo.valor).toBe('por tiempo');
  });

  it('"weighted front plank" es por tiempo', () => {
    const ejercicio = mapearRegistroDataset(registro({ name: 'weighted front plank' }));
    expect(ejercicio.tipo.valor).toBe('por tiempo');
  });

  it('"kettlebell hang clean" es por repeticiones', () => {
    const ejercicio = mapearRegistroDataset(registro({ name: 'kettlebell hang clean' }));
    expect(ejercicio.tipo.valor).toBe('por repeticiones');
  });

  it('con target upper back el músculo principal es Trapecio', () => {
    const ejercicio = mapearRegistroDataset(registro({ target: 'upper back' }));
    expect(ejercicio.musculoPrincipal.nombre).toBe('Trapecio');
  });

  it('con target spine el músculo principal es Lumbar', () => {
    const ejercicio = mapearRegistroDataset(registro({ target: 'spine' }));
    expect(ejercicio.musculoPrincipal.nombre).toBe('Lumbar');
  });

  it('el secundario es el primero traducible distinto del principal', () => {
    const ejercicio = mapearRegistroDataset(
      registro({ target: 'abs', secondary_muscles: ['hip flexors', 'core', 'obliques'] }),
    );
    // "hip flexors" se ignora y "core" se traduce a Abdominales, igual al principal: queda Oblicuos.
    expect(ejercicio.musculoSecundario?.nombre).toBe('Oblicuos');
  });

  it('"hip flexors" se ignora: queda sin secundario', () => {
    const ejercicio = mapearRegistroDataset(registro({ secondary_muscles: ['hip flexors'] }));
    expect(ejercicio.musculoSecundario).toBeNull();
  });

  it('la descripción son las instrucciones en español', () => {
    const ejercicio = mapearRegistroDataset(registro());
    expect(ejercicio.descripcion).toBe('Acostate boca arriba con las rodillas flexionadas.');
  });

  it('la URL del GIF apunta al repositorio del dataset con la atribución de Gym visual', () => {
    const ejercicio = mapearRegistroDataset(registro());
    expect(ejercicio.urlGif).toBe(
      'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0001-2gPfomN.gif',
    );
    expect(ejercicio.atribucion).toBe('© Gym visual — https://gymvisual.com/');
  });
});
