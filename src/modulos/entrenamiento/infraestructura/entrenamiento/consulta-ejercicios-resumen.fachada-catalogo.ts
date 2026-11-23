import { Inject, Injectable } from '@nestjs/common';
import { FachadaCatalogo } from '../../../catalogo/fachada-catalogo.js';
import type {
  ConsultaEjerciciosResumen,
  DatosEjercicioResumen,
} from '../../dominio/entrenamiento/consulta-ejercicios-resumen.puerto.js';

@Injectable()
export class ConsultaEjerciciosResumenFachadaCatalogo implements ConsultaEjerciciosResumen {
  constructor(@Inject(FachadaCatalogo) private readonly catalogo: FachadaCatalogo) {}

  async obtenerEjercicio(id: string): Promise<DatosEjercicioResumen | null> {
    const ejercicio = await this.catalogo.obtenerDatosParaResumen(id);
    if (!ejercicio) return null;
    const tipo = ejercicio.tipoCarga;
    if (
      tipo !== 'Sin Peso' &&
      tipo !== 'Peso Extra' &&
      tipo !== 'Peso Corporal' &&
      tipo !== 'Peso Corporal + Peso Extra'
    )
      throw new Error(`Tipo de carga desconocido: ${tipo}`);
    return { ...ejercicio, tipoCarga: tipo };
  }
}
