import type { EstrategiaCargaEfectiva } from '../estrategia-carga-efectiva.js';
import type { TipoCarga } from '../tipo-carga.js';
import { CargaPesoCorporal } from './carga-peso-corporal.estrategia.js';
import { CargaPesoCorporalYExtra } from './carga-peso-corporal-y-extra.estrategia.js';
import { CargaPesoExtra } from './carga-peso-extra.estrategia.js';
import { CargaSinPeso } from './carga-sin-peso.estrategia.js';

/** Selecciona la estrategia según el tipo de carga (RN-ENT-07). */
export function seleccionarEstrategiaCarga(tipoCarga: TipoCarga): EstrategiaCargaEfectiva {
  switch (tipoCarga) {
    case 'Sin Peso':
      return new CargaSinPeso();
    case 'Peso Corporal':
      return new CargaPesoCorporal();
    case 'Peso Extra':
      return new CargaPesoExtra();
    case 'Peso Corporal + Peso Extra':
      return new CargaPesoCorporalYExtra();
  }
}
