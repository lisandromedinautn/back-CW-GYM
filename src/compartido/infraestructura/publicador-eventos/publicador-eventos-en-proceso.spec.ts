import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicadorEventosEnProceso } from './publicador-eventos-en-proceso.js';

describe('RN-NOT-01 · un manejador que falla no corta la publicación ni la finalización', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('publicar no lanza y el segundo manejador se ejecuta aunque el primero falle', async () => {
    const publicador = new PublicadorEventosEnProceso();
    const evento = { nombre: 'EntrenamientoFinalizado' };
    const segundo = vi.fn().mockResolvedValue(undefined);
    publicador.suscribir('EntrenamientoFinalizado', async () => {
      throw new Error('falla del primer manejador');
    });
    publicador.suscribir('EntrenamientoFinalizado', segundo);

    await expect(publicador.publicar(evento)).resolves.toBeUndefined();

    expect(segundo).toHaveBeenCalledWith(evento);
  });
});
