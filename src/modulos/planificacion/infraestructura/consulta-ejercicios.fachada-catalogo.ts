import { Inject, Injectable } from '@nestjs/common';
import { FachadaCatalogo } from '../../catalogo/fachada-catalogo.js';
import { ConsultaEjercicios } from '../dominio/consulta-ejercicios.puerto.js';
import type { EjercicioDelCatalogo } from '../dominio/ejercicio-del-catalogo.js';

/** Tipos de carga que incluyen Peso Extra (RN-CAT-03, RN-PLAN-05). */
const CARGAS_CON_PESO_EXTRA = ['Peso Extra', 'Peso Corporal + Peso Extra'];

/** Adaptador del puerto `ConsultaEjercicios` sobre la Fachada de catálogo (CLAUDE.md, regla 4). */
@Injectable()
export class ConsultaEjerciciosFachadaCatalogo extends ConsultaEjercicios {
  constructor(@Inject(FachadaCatalogo) private readonly catalogo: FachadaCatalogo) {
    super();
  }

  async buscarPorId(id: string): Promise<EjercicioDelCatalogo | null> {
    const ejercicio = await this.catalogo.obtenerEjercicio(id);
    if (!ejercicio) return null;
    return {
      id: ejercicio.id,
      porTiempo: ejercicio.tipo === 'por tiempo',
      admitePesoExtra: CARGAS_CON_PESO_EXTRA.includes(ejercicio.tipoCarga),
    };
  }
}
