import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';

/**
 * T06: consulta paginada de las rutinas del profesor.
 * RN-PLAN-08: un profesor solo ve sus propias rutinas. La validación de `pagina` y `tamanio`
 * es del DTO de entrada.
 */
export class ConsultarRutinas {
  constructor(private readonly rutinas: RepositorioRutinas) {}

  async ejecutar(profesorUsuarioId: string, pagina = 1, tamanio = 10): Promise<Pagina<Rutina>> {
    const { items, total } = await this.rutinas.listarPorProfesor(
      profesorUsuarioId,
      pagina,
      tamanio,
    );
    return { items, total, pagina, tamanio };
  }
}
