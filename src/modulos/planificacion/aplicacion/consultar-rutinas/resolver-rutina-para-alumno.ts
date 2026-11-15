import type { ConsultaNombresEjercicios } from '../../dominio/rutina/consulta-nombres-ejercicios.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';

/** Un ejercicio prescripto con el nombre del catálogo ya resuelto (US08). */
export interface EjercicioDeLaRutinaRespuesta {
  ejercicioId: string;
  nombre: string;
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
}

/** Un bloque de la rutina del día (RN-PLAN-02). */
export interface BloqueDeLaRutinaRespuesta extends EjercicioDeLaRutinaRespuesta {
  series: number;
  micropausaSegundos: number;
  macropausaSegundos: number;
}

/** Un circuito de la rutina del día (RN-PLAN-03). */
export interface CircuitoDeLaRutinaRespuesta {
  vueltas: number;
  macropausaSegundos: number;
  ejercicios: EjercicioDeLaRutinaRespuesta[];
}

/** La rutina del alumno con los nombres de sus ejercicios. */
export interface RutinaParaAlumnoRespuesta {
  id: string;
  /** RN-PLAN-21. */
  nombre: string;
  tipo: string;
  bloques: BloqueDeLaRutinaRespuesta[];
  circuitos: CircuitoDeLaRutinaRespuesta[];
}

export async function resolverRutinaParaAlumno(
  rutina: Rutina,
  consultaNombres: ConsultaNombresEjercicios,
): Promise<RutinaParaAlumnoRespuesta> {
  const ids = [
    ...rutina.bloques.map((bloque) => bloque.ejercicio.ejercicioId),
    ...rutina.circuitos.flatMap((circuito) =>
      circuito.ejercicios.map((ejercicio) => ejercicio.ejercicioId),
    ),
  ];
  const nombres = new Map(
    (await consultaNombres.buscarPorIds(ids)).map(({ id, nombre }) => [id, nombre] as const),
  );
  const nombreDe = (ejercicioId: string): string => nombres.get(ejercicioId) ?? ejercicioId;

  return {
    id: rutina.id,
    nombre: rutina.nombre,
    tipo: rutina.tipo.valor,
    bloques: rutina.bloques.map((bloque) => ({
      ejercicioId: bloque.ejercicio.ejercicioId,
      nombre: nombreDe(bloque.ejercicio.ejercicioId),
      series: bloque.series,
      micropausaSegundos: bloque.micropausa.segundos,
      macropausaSegundos: bloque.macropausa.segundos,
      repeticiones: bloque.ejercicio.objetivo.repeticiones,
      segundos: bloque.ejercicio.objetivo.segundos,
      pesoKg: bloque.ejercicio.objetivo.pesoKg,
    })),
    circuitos: rutina.circuitos.map((circuito) => ({
      vueltas: circuito.vueltas,
      macropausaSegundos: circuito.macropausa.segundos,
      ejercicios: circuito.ejercicios.map((ejercicio) => ({
        ejercicioId: ejercicio.ejercicioId,
        nombre: nombreDe(ejercicio.ejercicioId),
        repeticiones: ejercicio.objetivo.repeticiones,
        segundos: ejercicio.objetivo.segundos,
        pesoKg: ejercicio.objetivo.pesoKg,
      })),
    })),
  };
}
