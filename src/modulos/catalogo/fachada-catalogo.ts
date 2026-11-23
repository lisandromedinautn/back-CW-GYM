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
  /** T14: GIF del ejercicio, para la copia del entrenamiento. */
  urlGif: string;
}

/**
 * Fachada de catálogo: la única puerta de entrada de otros módulos (CLAUDE.md, regla 4).
 * Vive en la raíz del módulo, fuera de las capas, para que la regla de lint de importaciones
 * entre módulos la permita.
 */
@Injectable()
export class FachadaCatalogo {
  constructor(@Inject(RepositorioEjercicios) private readonly ejercicios: RepositorioEjercicios) {}

  /** Datos de catálogo necesarios al cerrar un entrenamiento. */
  async obtenerDatosParaResumen(id: string): Promise<{
    tipoCarga: string;
    factorPesoCorporal: number | null;
    grupoPrincipal: string;
    grupoSecundario: string | null;
  } | null> {
    const ejercicio = await this.ejercicios.buscarPorId(id);
    return ejercicio
      ? {
          tipoCarga: ejercicio.tipoCarga.valor,
          factorPesoCorporal: ejercicio.factorPesoCorporal?.porcentaje ?? null,
          grupoPrincipal: ejercicio.musculoPrincipal.grupo,
          grupoSecundario: ejercicio.musculoSecundario?.grupo ?? null,
        }
      : null;
  }

  async obtenerEjercicio(id: string): Promise<EjercicioPublico | null> {
    const ejercicio = await this.ejercicios.buscarPorId(id);
    if (!ejercicio) return null;
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipo: ejercicio.tipo.valor,
      tipoCarga: ejercicio.tipoCarga.valor,
      urlGif: ejercicio.urlGif,
    };
  }
}
