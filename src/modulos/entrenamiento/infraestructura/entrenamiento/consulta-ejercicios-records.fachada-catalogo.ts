import { Inject, Injectable } from '@nestjs/common';
import { FachadaCatalogo } from '../../../catalogo/fachada-catalogo.js';
import type { TipoCarga } from '../../dominio/carga-efectiva/tipo-carga.js';
import type {
  ConsultaEjerciciosRecords,
  DatosEjercicioRecords,
} from '../../dominio/entrenamiento/consulta-ejercicios-records.puerto.js';
import type { TipoEjercicio } from '../../dominio/marcas-por-tipo-ejercicio/tipo-ejercicio.js';

const TIPOS_EJERCICIO: readonly TipoEjercicio[] = ['por tiempo', 'por repeticiones'];
const TIPOS_CARGA: readonly TipoCarga[] = [
  'Sin Peso',
  'Peso Extra',
  'Peso Corporal',
  'Peso Corporal + Peso Extra',
];

@Injectable()
export class ConsultaEjerciciosRecordsFachadaCatalogo implements ConsultaEjerciciosRecords {
  constructor(@Inject(FachadaCatalogo) private readonly catalogo: FachadaCatalogo) {}

  async obtenerDatosParaRecords(id: string): Promise<DatosEjercicioRecords | null> {
    const ejercicio = await this.catalogo.obtenerDatosParaRecords(id);
    if (!ejercicio) return null;
    if (!TIPOS_EJERCICIO.includes(ejercicio.tipo as TipoEjercicio))
      throw new Error(`Tipo de ejercicio desconocido: ${ejercicio.tipo}`);
    if (!TIPOS_CARGA.includes(ejercicio.tipoCarga as TipoCarga))
      throw new Error(`Tipo de carga desconocido: ${ejercicio.tipoCarga}`);
    return {
      ...ejercicio,
      tipo: ejercicio.tipo as TipoEjercicio,
      tipoCarga: ejercicio.tipoCarga as TipoCarga,
    };
  }
}
