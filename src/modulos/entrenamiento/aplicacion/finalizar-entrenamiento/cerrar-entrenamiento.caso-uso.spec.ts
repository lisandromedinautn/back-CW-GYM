import { describe, expect, it, vi } from 'vitest';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { RepositorioEntrenamientosEnMemoria } from '../../../../../test/dobles/entrenamiento.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import { RepositorioCierreEntrenamiento } from '../../dominio/entrenamiento/repositorio-cierre-entrenamiento.puerto.js';
import type { ResumenEntrenamiento } from '../../dominio/entrenamiento/resumen-entrenamiento.js';
import { FinalizarEntrenamiento } from './finalizar-entrenamiento.caso-uso.js';
import { CerrarEntrenamiento } from './cerrar-entrenamiento.caso-uso.js';

class CierreEnMemoria extends RepositorioCierreEntrenamiento {
  constructor(private readonly repo: RepositorioEntrenamientosEnMemoria) {
    super();
  }
  async finalizarAtomico(
    id: string,
    instante: Date,
    calcular: (entrenamiento: Entrenamiento) => Promise<ResumenEntrenamiento>,
  ) {
    const entrenamiento = await this.repo.buscarPorId(id);
    if (!entrenamiento) return null;
    entrenamiento.asegurarFinalizable(instante);
    entrenamiento.finalizar(instante, await calcular(entrenamiento));
    return entrenamiento;
  }
}

async function preparar(fecha: string, alumnoId = 'alumno') {
  const repo = new RepositorioEntrenamientosEnMemoria();
  const entrenamiento = Entrenamiento.crear({
    id: 'ent',
    alumnoId,
    inicio: '2026-11-22T10:00:00.000Z',
    pesoCorporalKg: 80,
    rutina: { id: 'r', nombre: 'Rutina', tipo: 'Bloques', bloques: [], circuitos: [] },
  });
  await repo.insertar(entrenamiento);
  const alumnos = { obtenerAlumnoConPeso: async () => ({ id: 'alumno', pesoKg: 90 }) };
  const ejercicios = { obtenerEjercicio: async () => null };
  const reloj = new RelojFijo(new Date(fecha));
  const publicar = vi.fn(async () => {});
  const calculo = new FinalizarEntrenamiento(repo, alumnos, ejercicios, reloj);
  return {
    entrenamiento,
    publicar,
    caso: new CerrarEntrenamiento(repo, new CierreEnMemoria(repo), alumnos, reloj, calculo, {
      publicar,
    }),
  };
}

describe('RN-ENT-05, 19, 20 · cierre de un entrenamiento', () => {
  it('guarda resumen, fin y evento; no se puede cerrar dos veces', async () => {
    const { caso, entrenamiento, publicar } = await preparar('2026-11-22T10:30:00.000Z');
    expect(await caso.ejecutar('usuario', 'ent')).toEqual({
      volumenKg: 0,
      duracionSegundos: 1800,
      gruposMusculares: [],
    });
    expect(entrenamiento.datos.fin).toBe('2026-11-22T10:30:00.000Z');
    expect(publicar).toHaveBeenCalledOnce();
    await expect(caso.ejecutar('usuario', 'ent')).rejects.toMatchObject({ codigo: 'RN-ENT-05' });
  });
  it('rechaza un entrenamiento de otro alumno', async () => {
    const { caso } = await preparar('2026-11-22T10:30:00.000Z', 'otro');
    await expect(caso.ejecutar('usuario', 'ent')).rejects.toMatchObject({
      categoria: 'no-encontrado',
    });
  });
  it('rechaza un entrenamiento abandonado', async () => {
    const { caso } = await preparar('2026-11-23T00:00:00.000Z');
    await expect(caso.ejecutar('usuario', 'ent')).rejects.toMatchObject({ codigo: 'RN-ENT-20' });
  });
});

describe('RN-ENT-21 · el cierre publica las series por debajo de lo prescripto', () => {
  async function prepararConBloque() {
    const repo = new RepositorioEntrenamientosEnMemoria();
    await repo.insertar(
      Entrenamiento.crear({
        id: 'ent',
        alumnoId: 'alumno',
        inicio: '2026-11-22T10:00:00.000Z',
        pesoCorporalKg: 80,
        rutina: {
          id: 'r',
          nombre: 'Fuerza',
          tipo: 'Bloques',
          bloques: [
            {
              orden: 1,
              ejercicioId: 'press',
              nombre: 'Press',
              repeticiones: 10,
              segundos: null,
              pesoKg: 30,
              series: 2,
              micropausaSegundos: 0,
              macropausaSegundos: 0,
            },
          ],
          circuitos: [],
        },
      }),
    );
    const alumnos = { obtenerAlumnoConPeso: async () => ({ id: 'alumno', pesoKg: 90 }) };
    const reloj = new RelojFijo(new Date('2026-11-22T10:30:00.000Z'));
    const calculo = new FinalizarEntrenamiento(
      repo,
      alumnos,
      { obtenerEjercicio: async () => null },
      reloj,
    );
    const publicar = vi.fn(async (_evento: unknown) => {});
    const caso = new CerrarEntrenamiento(repo, new CierreEnMemoria(repo), alumnos, reloj, calculo, {
      publicar,
    });
    return { caso, publicar };
  }

  it('publica EntrenamientoFinalizado con inicio, rutina, total y series por debajo', async () => {
    const { caso, publicar } = await prepararConBloque();
    await caso.ejecutar('usuario', 'ent');
    expect(publicar).toHaveBeenCalledOnce();
    const evento = publicar.mock.calls[0][0] as Record<string, unknown>;
    expect(evento).toMatchObject({
      nombre: 'EntrenamientoFinalizado',
      entrenamientoId: 'ent',
      alumnoId: 'alumno',
      fin: '2026-11-22T10:30:00.000Z',
      inicio: '2026-11-22T10:00:00.000Z',
      rutina: 'Fuerza',
      totalSeries: 2,
    });
    expect(evento.seriesPorDebajo).toEqual([
      {
        orden: 1,
        numero: 1,
        posicion: null,
        ejercicioId: 'press',
        nombre: 'Press',
        prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
        realizada: null,
      },
      {
        orden: 1,
        numero: 2,
        posicion: null,
        ejercicioId: 'press',
        nombre: 'Press',
        prescripta: { repeticiones: 10, segundos: null, pesoKg: 30 },
        realizada: null,
      },
    ]);
  });
});
