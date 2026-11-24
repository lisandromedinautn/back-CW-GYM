import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { SerieRealizada } from '../../dominio/entrenamiento/serie-realizada.valor.js';
import type { EntrenamientoEsquema } from './entrenamiento.esquema.js';
import type { SerieRealizadaEsquema } from './serie-realizada.esquema.js';

export function serieAFila(entrenamientoId: string, serie: SerieRealizada): SerieRealizadaEsquema {
  return { ...serie, entrenamientoId, posicion: serie.posicion ?? 0 };
}

export function filaASerie(fila: SerieRealizadaEsquema): SerieRealizada {
  return {
    orden: fila.orden,
    numero: fila.numero,
    posicion: fila.posicion === 0 ? null : fila.posicion,
    ejercicioId: fila.ejercicioId,
    nombre: fila.nombre,
    prescripta: fila.prescripta,
    realizada: fila.realizada,
  };
}

export function filaAEntrenamiento(
  fila: EntrenamientoEsquema,
  series: SerieRealizadaEsquema[],
): Entrenamiento {
  return Entrenamiento.reconstruir({
    id: fila.id,
    alumnoId: fila.alumnoId,
    pesoCorporalKg: fila.pesoCorporalKg,
    rutina: fila.rutina,
    inicio: fila.inicio.toISOString(),
    series: series.map(filaASerie),
    ...(fila.fin ? { fin: fila.fin.toISOString() } : {}),
    ...(fila.resumen ? { resumen: fila.resumen } : {}),
  });
}
