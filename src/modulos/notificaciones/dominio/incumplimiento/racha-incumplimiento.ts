/** Un Entrenamiento del alumno tal como lo ve la regla de incumplimiento repetido (RN-NOT-08). */
export interface EntrenamientoDelAlumno {
  entrenamientoId: string;
  estado: 'finalizado' | 'abandonado';
  /** Fecha del Entrenamiento (ISO): define el orden de la racha. */
  fecha: string;
  rutina: string;
  /** Tuvo al menos una serie por debajo de lo prescripto (RN-ENT-21). La percepción mala sola no cuenta. */
  porDebajo: boolean;
}

export const LARGO_RACHA = 3;

/**
 * RN-NOT-08: cada alerta es el grupo de 3 Entrenamientos seguidos por debajo que la origina.
 * Un finalizado que cumple corta la racha; un abandonado no cuenta ni corta; al completar 3 la
 * racha vuelve a cero.
 */
export function detectarRachasDeIncumplimiento(
  entrenamientos: EntrenamientoDelAlumno[],
): EntrenamientoDelAlumno[][] {
  const finalizados = entrenamientos
    .filter((e) => e.estado === 'finalizado')
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const alertas: EntrenamientoDelAlumno[][] = [];
  let racha: EntrenamientoDelAlumno[] = [];
  for (const entrenamiento of finalizados) {
    if (!entrenamiento.porDebajo) {
      racha = [];
      continue;
    }
    racha.push(entrenamiento);
    if (racha.length === LARGO_RACHA) {
      alertas.push(racha);
      racha = [];
    }
  }
  return alertas;
}
