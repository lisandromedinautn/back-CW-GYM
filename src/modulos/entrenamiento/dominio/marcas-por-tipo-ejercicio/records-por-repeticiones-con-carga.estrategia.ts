import { CargaEfectiva } from '../carga-efectiva/carga-efectiva.valor.js';
import type { MarcaRecord } from '../record-personal/marca-record.js';
import { UnoRMEstimado } from '../uno-rm-estimado/uno-rm-estimado.valor.js';
import { VolumenSerie } from '../volumen-serie/volumen-serie.valor.js';
import type { EstrategiaRecords } from './estrategia-records.js';
import type { SerieParaRecords } from './serie-para-records.js';

/** RN-ENT-10: repeticiones con carga generan repeticiones, volumen y 1RM. */
export class RecordsPorRepeticionesConCarga implements EstrategiaRecords {
  marcasDe({ serie, ejercicio, pesoCorporalKg }: SerieParaRecords): MarcaRecord[] {
    const repeticiones = serie.realizada.repeticiones;
    if (repeticiones === null) return [];

    const carga = CargaEfectiva.calcular({
      tipoCarga: ejercicio.tipoCarga,
      pesoCorporalKg,
      factorPesoCorporal: ejercicio.factorPesoCorporal,
      pesoExtraKg: serie.realizada.pesoKg ?? 0,
    });
    const volumen = VolumenSerie.calcular(carga, repeticiones);
    const unoRm = UnoRMEstimado.calcular(carga, repeticiones);

    const marcas: MarcaRecord[] = [
      { ejercicioId: serie.ejercicioId, tipo: 'repeticiones', valor: repeticiones },
      { ejercicioId: serie.ejercicioId, tipo: 'volumen', valor: volumen.kg },
    ];
    if (unoRm) {
      marcas.push({
        ejercicioId: serie.ejercicioId,
        tipo: '1rm',
        valor: unoRm.kg,
      });
    }
    return marcas;
  }
}
