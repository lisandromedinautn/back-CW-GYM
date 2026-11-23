import { describe, expect, it } from 'vitest';
import { type CopiaRutina, conGifs } from './copia-rutina.valor.js';

const press = {
  ejercicioId: 'press',
  nombre: 'press',
  repeticiones: 10,
  segundos: null,
  pesoKg: 30,
};
const plancha = {
  ejercicioId: 'plancha',
  nombre: 'plancha',
  repeticiones: null,
  segundos: 30,
  pesoKg: null,
};

const copia: CopiaRutina = {
  id: 'r1',
  nombre: 'Fuerza',
  tipo: 'Mixta',
  bloques: [{ ...press, orden: 2, series: 3, micropausaSegundos: 20, macropausaSegundos: 60 }],
  circuitos: [{ orden: 1, vueltas: 2, macropausaSegundos: 45, ejercicios: [press, plancha] }],
};

describe('RN-ENT-02 · la copia de la rutina guarda el GIF de cada ejercicio', () => {
  const gifs = new Map([['press', 'https://gifs.test/press.gif']]);

  it('el press del bloque y del circuito quedan con https://gifs.test/press.gif', () => {
    const resultado = conGifs(copia, gifs);

    expect([resultado.bloques[0]?.urlGif, resultado.circuitos[0]?.ejercicios[0]?.urlGif]).toEqual([
      'https://gifs.test/press.gif',
      'https://gifs.test/press.gif',
    ]);
  });

  it('la plancha, sin GIF en el catálogo, queda con urlGif null', () => {
    expect(conGifs(copia, gifs).circuitos[0]?.ejercicios[1]?.urlGif).toBeNull();
  });
});
