/** Medida de una serie: repeticiones o segundos, y peso opcional. Propio de este módulo. */
export type MedidaSerie = {
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
};

/** Una serie por debajo de lo prescripto (RN-ENT-21), con lo prescripto y lo realizado. */
export type SeriePorDebajo = {
  orden: number;
  numero: number;
  posicion: number | null;
  ejercicioId: string;
  nombre: string;
  prescripta: MedidaSerie;
  realizada: MedidaSerie | null;
};
