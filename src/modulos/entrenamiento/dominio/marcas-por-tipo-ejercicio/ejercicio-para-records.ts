import type { TipoCarga } from '../carga-efectiva/tipo-carga.js';
import type { TipoEjercicio } from './tipo-ejercicio.js';

/** Datos del ejercicio que necesita el cálculo de marcas (RN-ENT-10). */
export interface EjercicioParaRecords {
  id: string;
  tipo: TipoEjercicio;
  tipoCarga: TipoCarga;
  factorPesoCorporal: number;
}
