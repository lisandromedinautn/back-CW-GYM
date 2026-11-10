import { Inject, Injectable } from '@nestjs/common';
import { RepositorioEjercicios } from './dominio/ejercicio/repositorio-ejercicios.puerto.js';

/** Datos públicos de un ejercicio para otros módulos: solo tipos primitivos, sin clases del dominio. */
export interface EjercicioPublico {
  id: string;
  nombre: string;
  /** "por tiempo" o "por repeticiones" (RN-CAT-02). */
  tipo: string;
  /** Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra (RN-CAT-03). */
  tipoCarga: string;
}

/**
 * Fachada de catálogo: la única puerta de entrada de otros módulos (CLAUDE.md, regla 4).
 * Vive en la raíz del módulo, fuera de las capas, para que la regla de lint de importaciones
 * entre módulos la permita.
 */
@Injectable()
export class FachadaCatalogo {
  constructor(@Inject(RepositorioEjercicios) private readonly ejercicios: RepositorioEjercicios) {}

  async obtenerEjercicio(id: string): Promise<EjercicioPublico | null> {
    const ejercicio = await this.ejercicios.buscarPorId(id);
    if (!ejercicio) return null;
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipo: ejercicio.tipo.valor,
      tipoCarga: ejercicio.tipoCarga.valor,
    };
  }
}
