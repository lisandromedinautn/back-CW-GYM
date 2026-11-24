import { describe, expect, it } from 'vitest';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { RepositorioEntrenamientosEnMemoria } from '../../../../../test/dobles/entrenamiento.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import {
  FinalizarEntrenamiento,
  type DatosEjercicioResumen,
} from './finalizar-entrenamiento.caso-uso.js';

const horaInicio = '2026-11-22T10:00:00.000Z';
const reloj = new RelojFijo(new Date('2026-11-22T10:30:00.000Z'));
const tipos: Record<string, DatosEjercicioResumen> = {
  libre: {
    tipoCarga: 'Sin Peso',
    factorPesoCorporal: null,
    grupoPrincipal: 'Core',
    grupoSecundario: null,
  },
  extra: {
    tipoCarga: 'Peso Extra',
    factorPesoCorporal: null,
    grupoPrincipal: 'Pecho',
    grupoSecundario: 'Brazos',
  },
  corporal: {
    tipoCarga: 'Peso Corporal',
    factorPesoCorporal: 50,
    grupoPrincipal: 'Espalda',
    grupoSecundario: 'Brazos',
  },
  mixto: {
    tipoCarga: 'Peso Corporal + Peso Extra',
    factorPesoCorporal: 100,
    grupoPrincipal: 'Espalda',
    grupoSecundario: 'Brazos',
  },
};

async function preparar(conSeries: boolean) {
  const repositorio = new RepositorioEntrenamientosEnMemoria();
  const bloques = Object.keys(tipos).map((id, indice) => ({
    orden: indice + 1,
    ejercicioId: id,
    nombre: id,
    series: 1,
    micropausaSegundos: 60,
    macropausaSegundos: 60,
    repeticiones: 10,
    segundos: null,
    pesoKg: null,
  }));
  const entrenamiento = Entrenamiento.crear({
    id: 'ent',
    alumnoId: 'alumno',
    inicio: horaInicio,
    pesoCorporalKg: 80,
    rutina: { id: 'r', nombre: 'Rutina', tipo: 'Bloques', bloques, circuitos: [] },
  });
  if (conSeries) {
    entrenamiento.registrarSerie({ orden: 1, numero: 1, repeticiones: 20 }, new Date(horaInicio));
    entrenamiento.registrarSerie(
      { orden: 2, numero: 1, repeticiones: 5, pesoKg: 20 },
      new Date(horaInicio),
    );
    entrenamiento.registrarSerie({ orden: 3, numero: 1, repeticiones: 10 }, new Date(horaInicio));
    entrenamiento.registrarSerie(
      { orden: 4, numero: 1, repeticiones: 6, pesoKg: 10 },
      new Date(horaInicio),
    );
  }
  await repositorio.insertar(entrenamiento);
  const alumnos = { obtenerAlumnoConPeso: async () => ({ id: 'alumno', pesoKg: 100 }) };
  const ejercicios = { obtenerEjercicio: async (id: string) => tipos[id] ?? null };
  return new FinalizarEntrenamiento(repositorio, alumnos, ejercicios, reloj);
}

describe('RN-ENT-06 a 09 · resumen de series realizadas', () => {
  it('suma los cuatro tipos de carga sin repetir grupos musculares', async () => {
    expect(await (await preparar(true)).ejecutar('usuario', 'ent')).toEqual({
      volumenKg: 1040,
      duracionSegundos: 1800,
      gruposMusculares: ['Core', 'Pecho', 'Brazos', 'Espalda'],
    });
  });
  it('sin series muestra cero y ningún grupo', async () => {
    expect(await (await preparar(false)).ejecutar('usuario', 'ent')).toEqual({
      volumenKg: 0,
      duracionSegundos: 1800,
      gruposMusculares: [],
    });
  });
});
