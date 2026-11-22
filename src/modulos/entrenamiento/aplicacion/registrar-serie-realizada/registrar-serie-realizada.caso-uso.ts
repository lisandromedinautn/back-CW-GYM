import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaAlumno } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import type {
  RegistroSerie,
  SerieRealizada,
} from '../../dominio/entrenamiento/serie-realizada.valor.js';

export class RegistrarSerieRealizada {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly reloj: Reloj,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(
    usuarioId: string,
    entrenamientoId: string,
    registro: RegistroSerie,
  ): Promise<SerieRealizada> {
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');

    const entrenamiento = await this.entrenamientos.buscarPorId(entrenamientoId);
    // RN-ENT-19: el entrenamiento de otro alumno responde 404, igual que si no existiera.
    if (!entrenamiento || entrenamiento.datos.alumnoId !== alumno.id) {
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');
    }

    const evento = entrenamiento.registrarSerie(registro, this.reloj.ahora());
    await this.entrenamientos.guardarSerie(entrenamientoId, evento.serie);
    await this.publicador.publicar(evento);
    return evento.serie;
  }
}
