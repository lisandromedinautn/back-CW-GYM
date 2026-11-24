import { describe, expect, it } from 'vitest';
import {
  detectarRachasDeIncumplimiento,
  type EntrenamientoDelAlumno,
} from './racha-incumplimiento.js';

type Marca = 'debajo' | 'cumple' | 'abandonado' | 'percepcion-mala';

/** Arma la secuencia de un alumno, un Entrenamiento por día, a partir de marcas legibles. */
const secuencia = (...marcas: Marca[]): EntrenamientoDelAlumno[] =>
  marcas.map((marca, i) => ({
    entrenamientoId: `e${i + 1}`,
    estado: marca === 'abandonado' ? 'abandonado' : 'finalizado',
    fecha: new Date(Date.UTC(2026, 10, 1 + i, 10)).toISOString(),
    rutina: `Rutina ${i + 1}`,
    porDebajo: marca === 'debajo',
  }));

const ids = (rachas: EntrenamientoDelAlumno[][]) =>
  rachas.map((racha) => racha.map((e) => e.entrenamientoId));

describe('RN-NOT-08 · alerta por tres Entrenamientos seguidos por debajo', () => {
  it('A1 · tres finalizados por debajo generan una alerta con los tres', () => {
    const rachas = detectarRachasDeIncumplimiento(secuencia('debajo', 'debajo', 'debajo'));

    expect(ids(rachas)).toEqual([['e1', 'e2', 'e3']]);
    expect(rachas[0]!.map((e) => e.rutina)).toEqual(['Rutina 1', 'Rutina 2', 'Rutina 3']);
  });

  it('A2 · uno que cumple corta la racha', () => {
    const rachas = detectarRachasDeIncumplimiento(
      secuencia('debajo', 'cumple', 'debajo', 'debajo'),
    );

    expect(rachas).toEqual([]);
  });

  it('A3 · seis seguidos por debajo generan dos alertas, en el tercero y en el sexto', () => {
    const rachas = detectarRachasDeIncumplimiento(
      secuencia('debajo', 'debajo', 'debajo', 'debajo', 'debajo', 'debajo'),
    );

    expect(ids(rachas)).toEqual([
      ['e1', 'e2', 'e3'],
      ['e4', 'e5', 'e6'],
    ]);
  });

  it('A4 · un abandonado no cuenta ni corta', () => {
    const rachas = detectarRachasDeIncumplimiento(
      secuencia('debajo', 'abandonado', 'debajo', 'debajo'),
    );

    expect(ids(rachas)).toEqual([['e1', 'e3', 'e4']]);
  });

  it('A5 · la percepción mala sin series por debajo no cuenta', () => {
    const rachas = detectarRachasDeIncumplimiento(secuencia('debajo', 'debajo', 'percepcion-mala'));

    expect(rachas).toEqual([]);
  });

  it('ordena por fecha aunque lleguen desordenados', () => {
    const desordenados = secuencia('debajo', 'debajo', 'debajo').reverse();

    expect(ids(detectarRachasDeIncumplimiento(desordenados))).toEqual([['e1', 'e2', 'e3']]);
  });
});
