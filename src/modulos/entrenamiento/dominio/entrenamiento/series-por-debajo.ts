import type { CopiaRutina, EjercicioPrescriptoCopiado } from './copia-rutina.valor.js';
import type { MedidaSerie, SerieRealizada } from './serie-realizada.valor.js';

export interface SeriePorDebajo {
  orden: number;
  numero: number;
  posicion: number | null;
  ejercicioId: string;
  nombre: string;
  prescripta: MedidaSerie;
  realizada: MedidaSerie | null;
}

export interface ResultadoSeriesPorDebajo {
  totalSeries: number;
  porDebajo: SeriePorDebajo[];
}

export interface SeriePrescripta {
  orden: number;
  numero: number;
  posicion: number | null;
  ejercicio: EjercicioPrescriptoCopiado;
}

/** Todas las series prescriptas de la copia, en el orden de la rutina (bloques y circuitos). */
export function seriesPrescriptas(copia: CopiaRutina): SeriePrescripta[] {
  const porOrden: { orden: number; series: SeriePrescripta[] }[] = [];
  for (const bloque of copia.bloques) {
    porOrden.push({
      orden: bloque.orden,
      series: Array.from({ length: bloque.series }, (_, i) => ({
        orden: bloque.orden,
        numero: i + 1,
        posicion: null,
        ejercicio: bloque,
      })),
    });
  }
  for (const circuito of copia.circuitos) {
    const series: SeriePrescripta[] = [];
    for (let vuelta = 1; vuelta <= circuito.vueltas; vuelta++) {
      circuito.ejercicios.forEach((ejercicio, i) =>
        series.push({ orden: circuito.orden, numero: vuelta, posicion: i + 1, ejercicio }),
      );
    }
    porOrden.push({ orden: circuito.orden, series });
  }
  return porOrden.sort((a, b) => a.orden - b.orden).flatMap((grupo) => grupo.series);
}

const cantidad = (valor: number | null | undefined): number => valor ?? 0;

function quedaPorDebajo(prescripta: MedidaSerie, realizada: MedidaSerie): boolean {
  if (
    prescripta.repeticiones !== null &&
    cantidad(realizada.repeticiones) < prescripta.repeticiones
  )
    return true;
  if (prescripta.segundos !== null && cantidad(realizada.segundos) < prescripta.segundos)
    return true;
  return prescripta.pesoKg !== null && cantidad(realizada.pesoKg) < prescripta.pesoKg;
}

/** RN-ENT-21: hacer más que lo prescripto no compensa otra serie. */
export function seriesPorDebajo(
  copia: CopiaRutina,
  series: SerieRealizada[],
): ResultadoSeriesPorDebajo {
  const prescriptas = seriesPrescriptas(copia);
  const porDebajo: SeriePorDebajo[] = [];
  for (const { orden, numero, posicion, ejercicio } of prescriptas) {
    const hecha = series.find(
      (s) => s.orden === orden && s.numero === numero && s.posicion === posicion,
    );
    const prescripta: MedidaSerie = {
      repeticiones: ejercicio.repeticiones,
      segundos: ejercicio.segundos,
      pesoKg: ejercicio.pesoKg,
    };
    if (hecha && !quedaPorDebajo(prescripta, hecha.realizada)) continue;
    porDebajo.push({
      orden,
      numero,
      posicion,
      ejercicioId: ejercicio.ejercicioId,
      nombre: ejercicio.nombre,
      prescripta,
      realizada: hecha ? { ...hecha.realizada } : null,
    });
  }
  return { totalSeries: prescriptas.length, porDebajo };
}
