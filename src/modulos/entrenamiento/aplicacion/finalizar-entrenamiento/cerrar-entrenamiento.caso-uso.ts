import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaAlumno } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import { EntrenamientoFinalizado } from '../../dominio/entrenamiento/entrenamiento-finalizado.evento.js';
import type { RepositorioCierreEntrenamiento } from '../../dominio/entrenamiento/repositorio-cierre-entrenamiento.puerto.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import type { FinalizarEntrenamiento } from './finalizar-entrenamiento.caso-uso.js';

export class CerrarEntrenamiento {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly cierre: RepositorioCierreEntrenamiento,
    private readonly alumnos: ConsultaAlumno,
    private readonly reloj: Reloj,
    private readonly calculo: FinalizarEntrenamiento,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(usuarioId: string, id: string) {
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');
    const entrenamiento = await this.entrenamientos.buscarPorId(id);
    if (!entrenamiento || entrenamiento.datos.alumnoId !== alumno.id)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');
    const instante = this.reloj.ahora();
    entrenamiento.asegurarFinalizable(instante);
    const catalogo = await this.calculo.preparar(entrenamiento.datos);
    const finalizado = await this.cierre.finalizarAtomico(id, instante, async (actual) =>
      this.calculo.calcular(actual.datos, instante, catalogo),
    );
    if (!finalizado)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');
    await this.publicador.publicar(
      new EntrenamientoFinalizado(id, alumno.id, instante.toISOString()),
    );
    return finalizado.datos.resumen!;
  }
}
