import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaAlumno } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import type { DatosEntrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { DatosPercepcion } from '../../dominio/percepcion/percepcion.valor.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';

type ResultadoConsulta =
  | { estado: 'sin-entrenamiento' }
  | {
      estado: 'en-curso' | 'abandonado' | 'finalizado';
      entrenamiento: Omit<DatosEntrenamiento, 'percepcion'> & {
        percepcion?: DatosPercepcion | null;
      };
    };

export class ConsultarEntrenamientoEnCurso {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(usuarioId: string): Promise<ResultadoConsulta> {
    const ahora = this.reloj.ahora();
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');

    const ultimo = await this.entrenamientos.buscarUltimo(
      alumno.id,
      ahora.toISOString().slice(0, 10),
    );
    if (!ultimo) return { estado: 'sin-entrenamiento' };
    const estado = ultimo.estadoEn(ahora);
    const datos = ultimo.datos;
    // Solo el finalizado lleva percepcion (null si no se cargó): US17.
    return {
      estado,
      entrenamiento:
        estado === 'finalizado' ? { ...datos, percepcion: datos.percepcion ?? null } : datos,
    };
  }
}
