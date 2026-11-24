import { randomUUID } from 'node:crypto';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { detectarRachasDeIncumplimiento } from '../../dominio/incumplimiento/racha-incumplimiento.js';
import type { RepositorioFinalizaciones } from '../../dominio/incumplimiento/repositorio-finalizaciones.puerto.js';
import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import type { EntrenamientoFinalizadoRecibido } from '../../dominio/notificacion/entrenamiento-finalizado-recibido.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

/**
 * US23. Escucha EntrenamientoFinalizado. RN-NOT-08: registra el Entrenamiento y, si con él el
 * alumno completa 3 seguidos por debajo, alerta a su profesor. La alerta solo nace del
 * Entrenamiento que llega (nunca retroactiva), una sola vez, y requiere profesor vinculado.
 */
export class AlertarIncumplimientoRepetido {
  constructor(
    private readonly notificaciones: RepositorioNotificaciones,
    private readonly finalizaciones: RepositorioFinalizaciones,
    private readonly profesores: ConsultaProfesores,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(evento: EntrenamientoFinalizadoRecibido): Promise<void> {
    await this.finalizaciones.registrar(evento.alumnoId, {
      entrenamientoId: evento.entrenamientoId,
      estado: 'finalizado',
      fecha: evento.inicio,
      rutina: evento.rutina,
      porDebajo: evento.seriesPorDebajo.length > 0,
    });
    const historial = await this.finalizaciones.deAlumno(evento.alumnoId);
    const racha = detectarRachasDeIncumplimiento(historial).find(
      (grupo) => grupo[grupo.length - 1]!.entrenamientoId === evento.entrenamientoId,
    );
    if (racha === undefined) return;
    const vinculo = await this.profesores.profesorDelAlumno(evento.alumnoId);
    if (vinculo === null) return;
    if (await this.notificaciones.existeAlertaParaEntrenamiento(evento.entrenamientoId)) return;
    await this.notificaciones.guardar(
      Notificacion.crearAlertaIncumplimiento({
        id: randomUUID(),
        profesorId: vinculo.profesorId,
        alumno: vinculo.alumno,
        entrenamientos: racha.map((e) => ({
          id: e.entrenamientoId,
          fecha: e.fecha,
          rutina: e.rutina,
        })),
        creada: this.reloj.ahora().toISOString(),
      }),
    );
  }
}
