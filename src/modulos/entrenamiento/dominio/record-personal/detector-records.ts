import type { MarcaRecord } from './marca-record.js';
import { RecordPersonal } from './record-personal.entidad.js';
import type { RecordBatido } from './record-batido.evento.js';

export interface ContextoDeteccion {
  alumnoId: string;
  entrenamientoId: string;
  fecha: string;
}

export interface ResultadoDeteccion {
  guardados: RecordPersonal[];
  batidos: RecordBatido[];
}

/** RN-ENT-13: compara las marcas de un entrenamiento con los récords previos. */
export class DetectorRecords {
  detectar(
    marcas: MarcaRecord[],
    previos: RecordPersonal[],
    contexto: ContextoDeteccion,
  ): ResultadoDeteccion {
    const actuales = new Map<string, RecordPersonal>();
    for (const previo of previos) {
      const { ejercicioId, tipo } = previo.datos;
      actuales.set(clave(ejercicioId, tipo), previo);
    }

    const guardados: RecordPersonal[] = [];
    const batidos: RecordBatido[] = [];
    for (const marca of marcas) {
      const claveMarca = clave(marca.ejercicioId, marca.tipo);
      const previo = actuales.get(claveMarca);

      if (!previo) {
        const record = RecordPersonal.crear({
          alumnoId: contexto.alumnoId,
          ejercicioId: marca.ejercicioId,
          tipo: marca.tipo,
          valor: marca.valor,
          entrenamientoId: contexto.entrenamientoId,
          fecha: contexto.fecha,
        });
        actuales.set(claveMarca, record);
        guardados.push(record);
        continue;
      }

      const superado = previo.superarCon(marca.valor, {
        entrenamientoId: contexto.entrenamientoId,
        fecha: contexto.fecha,
      });
      if (!superado) continue;

      actuales.set(claveMarca, superado.record);
      guardados.push(superado.record);
      batidos.push(superado.evento);
    }

    return { guardados, batidos };
  }
}

function clave(ejercicioId: string, tipo: string): string {
  return `${ejercicioId}|${tipo}`;
}
