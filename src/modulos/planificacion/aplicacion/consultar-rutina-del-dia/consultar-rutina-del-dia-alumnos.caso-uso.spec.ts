import { beforeEach, describe, expect, it } from 'vitest';
import {
  ConsultaNombresEjerciciosFalsa,
  ConsultaVinculosFalsa,
  RelojFijo,
  RepositorioPlanesEnMemoria,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { ConsultarRutinaDelDia } from './consultar-rutina-del-dia.caso-uso.js';

const PRESS = { id: 'press', porTiempo: false, admitePesoExtra: true };
const PLANCHA = { id: 'plancha', porTiempo: true, admitePesoExtra: false };

describe('RN-PLAN-18 · cada alumno consulta exclusivamente su plan vigente', () => {
  let planes: RepositorioPlanesEnMemoria;
  let rutinas: RepositorioRutinasEnMemoria;
  let consulta: ConsultarRutinaDelDia;

  beforeEach(() => {
    planes = new RepositorioPlanesEnMemoria();
    rutinas = new RepositorioRutinasEnMemoria();
    consulta = new ConsultarRutinaDelDia(
      planes,
      rutinas,
      new ConsultaVinculosFalsa([], { 'u-ana': 'a-ana', 'u-bruno': 'a-bruno' }),
      new ConsultaNombresEjerciciosFalsa({ press: 'Press de pecho', plancha: 'Plancha' }),
      new RelojFijo(new Date('2026-11-01T12:00:00Z')),
    );
  });

  async function asignar(alumnoId: string, rutina: Rutina) {
    await rutinas.guardar(rutina);
    await planes.guardar(
      Plan.crear({
        profesorUsuarioId: 'u-profesor',
        fechaInicio: '2026-11-01',
        alumnoIds: [alumnoId],
        dias: Array.from({ length: 28 }, (_, indice) => ({
          numero: indice + 1,
          rutinaId: rutina.id,
        })),
      }),
    );
  }

  const rutinaDe = (nombre: string) =>
    Rutina.crear({
      profesorUsuarioId: 'u-profesor',
      nombre,
      bloques: [
        {
          ejercicio: PRESS,
          series: 3,
          micropausaSegundos: 60,
          macropausaSegundos: 120,
          repeticiones: 10,
        },
      ],
    });

  it('cada alumno obtiene su rutina', async () => {
    await asignar('a-ana', rutinaDe('Piernas de Ana'));
    await asignar('a-bruno', rutinaDe('Espalda de Bruno'));

    expect(await consulta.ejecutar('u-bruno')).toMatchObject({
      estado: 'rutina',
      fecha: '2026-11-01',
      numeroDia: 1,
      rutina: { nombre: 'Espalda de Bruno' },
    });
  });

  it('no muestra el plan de otro alumno', async () => {
    await asignar('a-ana', rutinaDe('Piernas de Ana'));

    expect(await consulta.ejecutar('u-bruno')).toEqual({ estado: 'sin-plan', fecha: '2026-11-01' });
  });

  it('devuelve objetivos y pausas de un circuito (RN-PLAN-03)', async () => {
    const rutina = Rutina.crear({
      profesorUsuarioId: 'u-profesor',
      nombre: 'Circuito de Ana',
      circuitos: [
        {
          vueltas: 3,
          macropausaSegundos: 90,
          ejercicios: [
            { ejercicio: PRESS, repeticiones: 10, pesoKg: 20 },
            { ejercicio: PLANCHA, segundos: 30 },
          ],
        },
      ],
    });
    await asignar('a-ana', rutina);

    expect(await consulta.ejecutar('u-ana')).toMatchObject({
      estado: 'rutina',
      rutina: {
        bloques: [],
        circuitos: [
          {
            vueltas: 3,
            macropausaSegundos: 90,
            ejercicios: [
              {
                ejercicioId: 'press',
                nombre: 'Press de pecho',
                repeticiones: 10,
                segundos: null,
                pesoKg: 20,
              },
              {
                ejercicioId: 'plancha',
                nombre: 'Plancha',
                repeticiones: null,
                segundos: 30,
                pesoKg: null,
              },
            ],
          },
        ],
      },
    });
  });
});
