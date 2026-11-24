import { describe, expect, it } from 'vitest';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { RepositorioEntrenamientosEnMemoria } from '../../../../../test/dobles/entrenamiento.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import { FinalizarEntrenamiento } from './finalizar-entrenamiento.caso-uso.js';

describe('RN-ENT-05 a 09 · finalizar el entrenamiento', () => {
  it('con dominada, 80 kg corporales, 10 kg extra y 6 repeticiones devuelve 540 kg', async () => {
    const repositorio = new RepositorioEntrenamientosEnMemoria();
    const entrenamiento = Entrenamiento.crear({
      id: 'entrenamiento',
      alumnoId: 'alumno',
      inicio: '2026-11-22T10:00:00.000Z',
      pesoCorporalKg: 80,
      rutina: {
        id: 'r',
        nombre: 'Rutina',
        tipo: 'Bloques',
        bloques: [
          {
            orden: 1,
            ejercicioId: 'dominada',
            nombre: 'Dominada',
            series: 1,
            micropausaSegundos: 60,
            macropausaSegundos: 60,
            repeticiones: 6,
            segundos: null,
            pesoKg: 10,
          },
        ],
        circuitos: [],
      },
    });
    entrenamiento.registrarSerie(
      { orden: 1, numero: 1, repeticiones: 6, pesoKg: 10 },
      new Date('2026-11-22T10:10:00.000Z'),
    );
    await repositorio.insertar(entrenamiento);
    const alumnos = { obtenerAlumnoConPeso: async () => ({ id: 'alumno', pesoKg: 90 }) };
    const ejercicios = {
      obtenerEjercicio: async () => ({
        tipoCarga: 'Peso Corporal + Peso Extra' as const,
        factorPesoCorporal: 100,
        grupoPrincipal: 'Espalda',
        grupoSecundario: 'Brazos',
      }),
    };
    const caso = new FinalizarEntrenamiento(
      repositorio,
      alumnos,
      ejercicios,
      new RelojFijo(new Date('2026-11-22T10:30:00.000Z')),
    );
    expect(await caso.ejecutar('usuario', 'entrenamiento')).toMatchObject({
      volumenKg: 540,
      duracionSegundos: 1800,
      gruposMusculares: ['Espalda', 'Brazos'],
    });
  });
});
