import { randomUUID } from 'node:crypto';
import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { type CopiaRutina, conGifs } from '../../dominio/entrenamiento/copia-rutina.valor.js';
import type {
  ConsultaAlumno,
  ConsultaEjercicios,
  ConsultaRutinaDelDia,
} from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';

export class IniciarEntrenamiento {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly rutinas: ConsultaRutinaDelDia,
    private readonly reloj: Reloj,
    private readonly publicador: PublicadorEventos,
    private readonly ejercicios: ConsultaEjercicios,
  ) {}

  async ejecutar(usuarioId: string) {
    const inicio = this.reloj.ahora().toISOString();
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');

    const dia = await this.rutinas.consultarRutinaDelDia(alumno.id, inicio.slice(0, 10));
    if (dia.estado !== 'rutina') {
      throw new ErrorDominio(
        'RN-ENT-01',
        dia.estado === 'descanso' ? 'Hoy es día de descanso' : 'No tenés un plan vigente',
        'conflicto',
      );
    }
    const entrenamiento = Entrenamiento.crear({
      id: randomUUID(),
      alumnoId: alumno.id,
      inicio,
      pesoCorporalKg: alumno.pesoKg,
      rutina: conGifs(dia.rutina, await this.gifsDe(dia.rutina)),
    });
    if (!(await this.entrenamientos.insertar(entrenamiento))) {
      throw new ErrorDominio('RN-ENT-01', 'Ya iniciaste un entrenamiento hoy', 'conflicto');
    }
    await this.publicador.publicar(entrenamiento.eventoDeInicio());
    return entrenamiento.datos;
  }

  /** RN-ENT-02 (T14): el GIF del catálogo de cada ejercicio de la rutina. */
  private async gifsDe(rutina: CopiaRutina): Promise<Map<string, string>> {
    const ids = new Set([
      ...rutina.bloques.map((b) => b.ejercicioId),
      ...rutina.circuitos.flatMap((c) => c.ejercicios.map((e) => e.ejercicioId)),
    ]);
    const gifs = new Map<string, string>();
    for (const id of ids) {
      const ejercicio = await this.ejercicios.obtenerEjercicio(id);
      if (ejercicio) gifs.set(id, ejercicio.urlGif);
    }
    return gifs;
  }
}
