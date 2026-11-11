/** T06: tamaños de página válidos en todos los listados paginados. */
export const TAMANIOS_PAGINA = [5, 10, 20, 50, 100] as const;

/** Una página de resultados. `pagina` arranca en 1. */
export interface Pagina<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanio: number;
}
