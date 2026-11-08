import type { Ejercicio } from '../dominio/ejercicio.entidad.js';
import { RepositorioEjercicios } from '../dominio/repositorio-ejercicios.puerto.js';

/** Lista el catálogo completo ordenado alfabéticamente por nombre. */
export class ListarEjercicios {
  constructor(private readonly repositorio: RepositorioEjercicios) {}

  async ejecutar(): Promise<Ejercicio[]> {
    const ejercicios = await this.repositorio.listar();
    return [...ejercicios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'en'));
  }
}
