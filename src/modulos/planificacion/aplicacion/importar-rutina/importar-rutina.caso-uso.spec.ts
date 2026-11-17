import { describe, expect, it } from 'vitest';
import { RepositorioRutinasEnMemoria } from '../../../../../test/dobles/planificacion.js';
import { Bloque } from '../../dominio/rutina/bloque.entidad.js';
import { Circuito } from '../../dominio/rutina/circuito.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ImportarRutina } from './importar-rutina.caso-uso.js';

function rutina(nombre = 'Piernas', profesor = 'laura'): Rutina {
  const bloque = Bloque.reconstruir('bloque-original', {
    ejercicioId: 'sentadillas',
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 90,
    repeticiones: 10,
    segundos: null,
    pesoKg: null,
  });
  const circuito = Circuito.reconstruir('circuito-original', {
    vueltas: 3,
    macropausaSegundos: 60,
    ejercicios: [
      { ejercicioId: 'plancha', segundos: 30, repeticiones: null, pesoKg: null },
      { ejercicioId: 'sentadillas', segundos: null, repeticiones: 12, pesoKg: 20 },
    ],
  });
  return Rutina.reconstruir('original', profesor, [bloque], [circuito], nombre, {
    bloques: [2],
    circuitos: [1],
  });
}

describe('RN-PLAN-08 · importar crea una copia independiente de una rutina propia', () => {
  it('conserva contenido y orden, con identidades nuevas', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    const original = rutina();
    await repo.guardar(original);
    const copia = await new ImportarRutina(repo).ejecutar('laura', original.id);
    expect([copia.nombre, copia.elementos.map((e) => e.tipo)]).toEqual([
      'Piernas - Copia',
      ['circuito', 'bloque'],
    ]);
    expect(copia.id).not.toBe(original.id);
    expect(copia.bloques[0]?.id).not.toBe(original.bloques[0]?.id);
    expect(copia.circuitos[0]?.id).not.toBe(original.circuitos[0]?.id);
    expect(copia.bloques[0]?.ejercicio).toEqual(original.bloques[0]?.ejercicio);
    expect(copia.circuitos[0]?.ejercicios).toEqual(original.circuitos[0]?.ejercicios);
    expect([
      copia.bloques[0]?.series,
      copia.bloques[0]?.micropausa.segundos,
      copia.bloques[0]?.macropausa.segundos,
      copia.circuitos[0]?.vueltas,
      copia.circuitos[0]?.macropausa.segundos,
    ]).toEqual([3, 60, 90, 3, 60]);
    expect((await repo.buscarPorId('original'))?.nombre).toBe('Piernas');
  });

  it('copia rutinas que tienen solo bloques o solo circuitos', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    const mixta = rutina();
    await repo.guardar(
      Rutina.reconstruir('solo-bloques', 'laura', [...mixta.bloques], [], 'Bloques'),
    );
    await repo.guardar(
      Rutina.reconstruir('solo-circuitos', 'laura', [], [...mixta.circuitos], 'Circuitos'),
    );
    const caso = new ImportarRutina(repo);
    const bloques = await caso.ejecutar('laura', 'solo-bloques');
    const circuitos = await caso.ejecutar('laura', 'solo-circuitos');
    expect([bloques.elementos.map((e) => e.tipo), circuitos.elementos.map((e) => e.tipo)]).toEqual([
      ['bloque'],
      ['circuito'],
    ]);
    expect(bloques.bloques[0]?.ejercicio).toEqual(mixta.bloques[0]?.ejercicio);
    expect(circuitos.circuitos[0]?.ejercicios).toEqual(mixta.circuitos[0]?.ejercicios);
  });

  it('rechaza una rutina inexistente o de otro profesor sin guardar', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    await repo.guardar(rutina());
    const caso = new ImportarRutina(repo);
    await expect(caso.ejecutar('otro', 'original')).rejects.toMatchObject({
      codigo: 'RN-PLAN-08',
      categoria: 'no-encontrado',
    });
    await expect(caso.ejecutar('laura', 'inexistente')).rejects.toMatchObject({
      codigo: 'RN-PLAN-08',
      categoria: 'no-encontrado',
    });
    expect(repo.rutinas).toHaveLength(1);
  });
});

describe('RN-PLAN-21 · nombres únicos por profesor', () => {
  it('numera copias sin distinguir mayúsculas y sin contar otros profesores', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    await repo.guardar(rutina());
    const caso = new ImportarRutina(repo);
    const primera = await caso.ejecutar('laura', 'original');
    primera.renombrar('PIERNAS - COPIA');
    const segunda = await caso.ejecutar('laura', 'original');
    const tercera = await caso.ejecutar('laura', 'original');
    expect([primera.nombre, segunda.nombre, tercera.nombre]).toEqual([
      'PIERNAS - COPIA',
      'Piernas - Copia 2',
      'Piernas - Copia 3',
    ]);
  });

  it('recorta un nombre de 60 caracteres para conservar el sufijo', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    await repo.guardar(rutina('A'.repeat(60)));
    expect((await new ImportarRutina(repo).ejecutar('laura', 'original')).nombre).toBe(
      `${'A'.repeat(52)} - Copia`,
    );
  });

  it('ignora los nombres de otro profesor', async () => {
    const repo = new RepositorioRutinasEnMemoria();
    await repo.guardar(rutina());
    const otra = Rutina.reconstruir('otra', 'diego', [...rutina().bloques], [], 'Piernas - Copia');
    await repo.guardar(otra);
    expect((await new ImportarRutina(repo).ejecutar('laura', 'original')).nombre).toBe(
      'Piernas - Copia',
    );
  });
});
