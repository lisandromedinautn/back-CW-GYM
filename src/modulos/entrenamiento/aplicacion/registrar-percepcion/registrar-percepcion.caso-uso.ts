import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaAlumno } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import { Percepcion, type DatosPercepcion } from '../../dominio/percepcion/percepcion.valor.js';

export class RegistrarPercepcion {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly reloj: Reloj,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(
    usuarioId: string,
    entrenamientoId: string,
    rpe: number,
    sensacionFuerza: number,
  ): Promise<DatosPercepcion> {
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');
    const entrenamiento = await this.entrenamientos.buscarPorId(entrenamientoId);
    // RN-ENT-19: el entrenamiento de otro alumno responde 404, igual que si no existiera.
    if (!entrenamiento || entrenamiento.datos.alumnoId !== alumno.id)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');

    const percepcion = Percepcion.crear(rpe, sensacionFuerza);
    const evento = entrenamiento.registrarPercepcion(percepcion, this.reloj.ahora());
    // Escritura condicional (percepcion IS NULL): dos cargas simultáneas no quedan las dos.
    if (!(await this.entrenamientos.guardarPercepcion(entrenamientoId, percepcion.datos)))
      throw new ErrorDominio('RN-ENT-16', 'La percepción ya fue cargada', 'conflicto');
    await this.publicador.publicar(evento);
    return percepcion.datos;
  }
}
