import { randomUUID } from 'node:crypto';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

/**
 * US21. Escucha EntrenamientoFinalizado. RN-NOT-01: una notificación por Entrenamiento por debajo,
 * para el profesor del alumno. Sin series por debajo, sin profesor o ya notificado, no hace nada.
 */
export class NotificarEntrenamientoPorDebajo {
  constructor(
    private readonly repositorio: RepositorioNotificaciones,
    private readonly profesores: ConsultaProfesores,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(evento: EntrenamientoFinalizadoRecibido): Promise<void> {
    if (evento.seriesPorDebajo.length === 0) return;
    const vinculo = await this.profesores.profesorDelAlumno(evento.alumnoId);
    if (vinculo === null) return;
    if (await this.repositorio.existeParaEntrenamiento(evento.entrenamientoId)) return;
    await this.repositorio.guardar(
      Notificacion.crear({
        id: randomUUID(),
        profesorId: vinculo.profesorId,
        alumno: vinculo.alumno,
        entrenamiento: { id: evento.entrenamientoId, rutina: evento.rutina, inicio: evento.inicio },
        totalSeries: evento.totalSeries,
        seriesPorDebajo: evento.seriesPorDebajo,
        creada: this.reloj.ahora().toISOString(),
      }),
    );
  }
}
