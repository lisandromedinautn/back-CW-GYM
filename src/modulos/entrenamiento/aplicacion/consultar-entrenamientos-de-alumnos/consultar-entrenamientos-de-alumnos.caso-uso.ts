import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaVinculos } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import type { DatosEntrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';

export type EntrenamientoDeAlumno = DatosEntrenamiento & { estado: 'en-curso' | 'abandonado' };

/**
 * US18. El profesor consulta los entrenamientos de un alumno, del más nuevo al más viejo.
 * RN-ENT-18: solo de sus alumnos. Un alumno ajeno o inexistente responde el mismo 403, para no
 * revelar si existe. El estado sale del `Reloj` (RN-ENT-20).
 */
export class ConsultarEntrenamientosDeAlumnos {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly vinculos: ConsultaVinculos,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(
    profesorUsuarioId: string,
    alumnoId: string,
    { pagina = 1, tamanio = 10 }: { pagina?: number; tamanio?: number } = {},
  ): Promise<Pagina<EntrenamientoDeAlumno>> {
    if (!(await this.vinculos.alumnoVinculadoAProfesor(alumnoId, profesorUsuarioId))) {
      throw new ErrorDominio(
        'RN-ENT-18',
        'Solo podés consultar los entrenamientos de tus alumnos',
        'prohibido',
      );
    }
    const ahora = this.reloj.ahora();
    const { items, total } = await this.entrenamientos.listarPorAlumno(alumnoId, pagina, tamanio);
    return {
      items: items.map((entrenamiento) => ({
        ...entrenamiento.datos,
        estado: entrenamiento.estadoEn(ahora),
      })),
      total,
      pagina,
      tamanio,
    };
  }
}
