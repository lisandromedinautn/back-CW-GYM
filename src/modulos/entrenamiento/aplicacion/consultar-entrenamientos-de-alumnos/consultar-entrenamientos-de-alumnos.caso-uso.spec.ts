import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaVinculosFija,
  RepositorioEntrenamientosEnMemoria,
} from '../../../../../test/dobles/entrenamiento.js';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import { ConsultarEntrenamientosDeAlumnos } from './consultar-entrenamientos-de-alumnos.caso-uso.js';

const codigoDelError = async (accion: () => Promise<unknown>): Promise<string | undefined> => {
  try {
    await accion();
  } catch (error) {
    if (error instanceof ErrorDominio) return error.codigo;
    throw error;
  }
  return undefined;
};

const entrenamiento = (id: string, alumnoId: string, inicio: string) =>
  Entrenamiento.crear({
    id,
    alumnoId,
    inicio,
    pesoCorporalKg: 80,
    rutina: { id: 'rutina', nombre: 'Fuerza', tipo: 'Bloques', bloques: [], circuitos: [] },
  });

describe('RN-ENT-18 · el profesor consulta solo los entrenamientos de sus alumnos', () => {
  let consultar: ConsultarEntrenamientosDeAlumnos;

  beforeEach(async () => {
    const repositorio = new RepositorioEntrenamientosEnMemoria();
    await repositorio.insertar(entrenamiento('e-20', 'A1', '2026-11-20T10:00:00.000Z'));
    await repositorio.insertar(entrenamiento('e-21', 'A1', '2026-11-21T09:00:00.000Z'));
    await repositorio.insertar(entrenamiento('e-a2', 'A2', '2026-11-21T09:00:00.000Z'));
    consultar = new ConsultarEntrenamientosDeAlumnos(
      repositorio,
      new ConsultaVinculosFija({ A1: 'P1', A2: 'P2' }),
      new RelojFijo(new Date('2026-11-21T12:00:00.000Z')),
    );
  });

  it('P1 ve los 2 entrenamientos de A1: el del 21/11 en curso y después el del 20/11 abandonado', async () => {
    const pagina = await consultar.ejecutar('P1', 'A1');
    expect({
      total: pagina.total,
      items: pagina.items.map(({ id, estado }) => ({ id, estado })),
    }).toEqual({
      total: 2,
      items: [
        { id: 'e-21', estado: 'en-curso' },
        { id: 'e-20', estado: 'abandonado' },
      ],
    });
  });

  it('P1 no ve los entrenamientos de A2, vinculado a P2: RN-ENT-18', async () => {
    expect(await codigoDelError(() => consultar.ejecutar('P1', 'A2'))).toBe('RN-ENT-18');
  });

  it('P1 consulta un alumno inexistente: RN-ENT-18', async () => {
    expect(await codigoDelError(() => consultar.ejecutar('P1', 'no-existe'))).toBe('RN-ENT-18');
  });
});
