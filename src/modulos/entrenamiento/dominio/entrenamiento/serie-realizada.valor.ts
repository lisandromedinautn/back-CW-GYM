/** Medida de una serie: repeticiones o segundos, y peso si corresponde. */
export interface MedidaSerie {
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
}

/**
 * Lo que el alumno pide registrar. `orden` señala el bloque o el circuito de la copia;
 * `numero` es la serie del bloque o la vuelta del circuito; `posicion` (desde 1) es el
 * ejercicio dentro del circuito y solo aplica a circuitos.
 */
export interface RegistroSerie {
  orden: number;
  numero: number;
  posicion?: number | null;
  repeticiones?: number | null;
  segundos?: number | null;
  pesoKg?: number | null;
}

/** Serie Realizada (RN-ENT-03): lo hecho junto a lo prescripto en la copia, para compararlos. */
export interface SerieRealizada {
  orden: number;
  numero: number;
  posicion: number | null;
  ejercicioId: string;
  nombre: string;
  prescripta: MedidaSerie;
  realizada: MedidaSerie;
}
