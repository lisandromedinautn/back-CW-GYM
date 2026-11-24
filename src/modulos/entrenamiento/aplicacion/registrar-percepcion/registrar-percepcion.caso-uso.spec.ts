import { describe, expect, it, vi } from 'vitest';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { RepositorioEntrenamientosEnMemoria } from '../../../../../test/dobles/entrenamiento.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import { RegistrarPercepcion } from './registrar-percepcion.caso-uso.js';

async function preparar(alumnoDelEntrenamiento: string) {
  const repo = new RepositorioEntrenamientosEnMemoria();
  const entrenamiento = Entrenamiento.crear({
    id: 'ent',
    alumnoId: alumnoDelEntrenamiento,
    inicio: '2026-11-20T10:00:00.000Z',
    pesoCorporalKg: 80,
    rutina: { id: 'r', nombre: 'Fuerza', tipo: 'Bloques', bloques: [], circuitos: [] },
  });
  entrenamiento.finalizar(new Date('2026-11-20T10:30:00.000Z'), {
    volumenKg: 0,
    duracionSegundos: 1800,
    gruposMusculares: [],
  });
  await repo.insertar(entrenamiento);
  const publicar = vi.fn(async () => {});
  const caso = new RegistrarPercepcion(
    repo,
    { obtenerAlumnoConPeso: async () => ({ id: 'alumno', pesoKg: 80 }) },
    new RelojFijo(new Date('2026-11-20T11:00:00.000Z')),
    { publicar },
  );
  return { repo, caso, publicar };
}

describe('RN-ENT-16 y RN-ENT-19 · registrar la percepción del propio entrenamiento', () => {
  it('con un entrenamiento propio finalizado guarda la percepción y publica 1 evento', async () => {
    const { repo, caso, publicar } = await preparar('alumno');

    const respuesta = await caso.ejecutar('usuario', 'ent', 9, 2);

    expect(respuesta).toEqual({ rpe: 9, sensacionFuerza: 2 });
    expect((await repo.buscarPorId('ent'))?.datos.percepcion).toEqual({
      rpe: 9,
      sensacionFuerza: 2,
    });
    expect(publicar).toHaveBeenCalledOnce();
    expect(publicar).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'PercepcionRegistrada', entrenamientoId: 'ent' }),
    );
  });

  it('con el entrenamiento de otro alumno da no encontrado y no publica nada', async () => {
    const { caso, publicar } = await preparar('otro');

    await expect(caso.ejecutar('usuario', 'ent', 9, 2)).rejects.toMatchObject({
      categoria: 'no-encontrado',
    });
    expect(publicar).not.toHaveBeenCalled();
  });
});
