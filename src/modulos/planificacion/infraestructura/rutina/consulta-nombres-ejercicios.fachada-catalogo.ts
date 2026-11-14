import { Inject, Injectable } from '@nestjs/common';
import { FachadaCatalogo } from '../../../catalogo/fachada-catalogo.js';
import {
  ConsultaNombresEjercicios,
  type NombreDeEjercicio,
} from '../../dominio/rutina/consulta-nombres-ejercicios.puerto.js';

/** Adaptador del puerto `ConsultaNombresEjercicios` sobre la Fachada de catálogo (US08). */
@Injectable()
export class ConsultaNombresEjerciciosFachadaCatalogo extends ConsultaNombresEjercicios {
  constructor(@Inject(FachadaCatalogo) private readonly catalogo: FachadaCatalogo) {
    super();
  }

  async buscarPorIds(ids: readonly string[]): Promise<NombreDeEjercicio[]> {
    const unicos = [...new Set(ids)];
    const ejercicios = await Promise.all(unicos.map((id) => this.catalogo.obtenerEjercicio(id)));
    return ejercicios.flatMap((ejercicio) =>
      ejercicio ? [{ id: ejercicio.id, nombre: ejercicio.nombre }] : [],
    );
  }
}
