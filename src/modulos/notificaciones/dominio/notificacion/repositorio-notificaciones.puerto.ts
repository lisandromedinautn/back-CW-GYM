import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { Notificacion } from './notificacion.entidad.js';

export abstract class RepositorioNotificaciones {
  abstract guardar(notificacion: Notificacion): Promise<void>;
  /** La notificación, o null si no existe. */
  abstract buscarPorId(id: string): Promise<Notificacion | null>;
  /** RN-NOT-01: ya hay una notificación para ese Entrenamiento. */
  abstract existeParaEntrenamiento(entrenamientoId: string): Promise<boolean>;
  /** RN-NOT-08: ya hay una alerta de incumplimiento anclada a ese Entrenamiento. */
  abstract existeAlertaParaEntrenamiento(entrenamientoId: string): Promise<boolean>;
  /** RN-NOT-05: la notificación del Entrenamiento, o null si no tiene. */
  abstract buscarPorEntrenamiento(entrenamientoId: string): Promise<Notificacion | null>;
  /** RN-NOT-03: del más nuevo al más viejo por fecha de creación. */
  abstract listarDeProfesor(
    profesorId: string,
    pagina: number,
    tamanio: number,
  ): Promise<Pagina<Notificacion>>;
  /** RN-NOT-03: cantidad de notificaciones no leídas del profesor. */
  abstract contarNoLeidas(profesorId: string): Promise<number>;
}
