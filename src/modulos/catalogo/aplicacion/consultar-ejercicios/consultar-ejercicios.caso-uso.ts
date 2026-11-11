import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
import type { FiltrosEjercicios } from '../../dominio/ejercicio/filtros-ejercicios.js';
import type { RepositorioEjercicios } from '../../dominio/ejercicio/repositorio-ejercicios.puerto.js';

/** T06 y T07: consulta paginada del catálogo con buscador y filtros (RN-UI-LIS-01 y 02). */
export class ConsultarEjercicios {
  constructor(private readonly repositorio: RepositorioEjercicios) {}

  async ejecutar(
    filtros: FiltrosEjercicios,
    pagina: number,
    tamanio: number,
  ): Promise<Pagina<Ejercicio>> {
    const { items, total } = await this.repositorio.consultar(filtros, pagina, tamanio);
    return { items, total, pagina, tamanio };
  }
}
