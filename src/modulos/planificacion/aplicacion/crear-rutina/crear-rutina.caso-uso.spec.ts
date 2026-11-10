import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaEjerciciosFalsa,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { CrearRutina, type PedidoBloque } from './crear-rutina.caso-uso.js';

describe('RN-PLAN-06 · la rutina referencia ejercicios del catálogo que tienen que existir', () => {
  let rutinas: RepositorioRutinasEnMemoria;
  let crearRutina: CrearRutina;

  const bloque = (ejercicioId: string): PedidoBloque => ({
    ejercicioId,
    series: 3,
    micropausaSegundos: 60,
    macropausaSegundos: 120,
    repeticiones: 10,
  });

  beforeEach(() => {
    rutinas = new RepositorioRutinasEnMemoria();
    crearRutina = new CrearRutina(
      rutinas,
      new ConsultaEjerciciosFalsa([
        { id: 'lever-chest-press', porTiempo: false, admitePesoExtra: true },
      ]),
    );
  });

  it('con un ejercicio inexistente se rechaza con RN-PLAN-06 (no encontrado)', async () => {
    const error = await crearRutina
      .ejecutar('u-laura', { bloques: [bloque('no-existe')] })
      .catch((e: unknown) => e);

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-06',
      'no-encontrado',
    ]);
  });

  it('con ejercicios existentes la rutina queda guardada para el profesor u-laura', async () => {
    await crearRutina.ejecutar('u-laura', { bloques: [bloque('lever-chest-press')] });

    expect(rutinas.rutinas.map((rutina) => rutina.profesorUsuarioId)).toEqual(['u-laura']);
  });
});
