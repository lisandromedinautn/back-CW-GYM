import type { TipoCarga } from '../carga-efectiva/tipo-carga.js';
import type { TipoEjercicio } from '../marcas-por-tipo-ejercicio/tipo-ejercicio.js';

/** Datos de catálogo que necesita la detección de récords (RN-ENT-10, 13). */
export interface DatosEjercicioRecords {
  id: string;
  nombre: string;
  tipo: TipoEjercicio;
  tipoCarga: TipoCarga;
  factorPesoCorporal: number | null;
}

export interface ConsultaEjerciciosRecords {
  obtenerDatosParaRecords(id: string): Promise<DatosEjercicioRecords | null>;
}
