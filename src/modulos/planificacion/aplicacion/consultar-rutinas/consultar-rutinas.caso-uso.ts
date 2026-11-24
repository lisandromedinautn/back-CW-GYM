import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
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

  /** US06: el detalle de una rutina propia, para verla y editarla. Ajena o inexistente: 404. */
  async porId(profesorUsuarioId: string, rutinaId: string): Promise<Rutina> {
    const rutina = await this.rutinas.buscarPorId(rutinaId);
    if (!rutina || rutina.profesorUsuarioId !== profesorUsuarioId) {
      throw new ErrorDominio('RN-PLAN-08', 'La rutina no existe', 'no-encontrado');
    }
    return rutina;
  }
}
