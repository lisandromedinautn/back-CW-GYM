import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

/**
 * US21. RN-NOT-04: el profesor marca como leída su notificación. Una ajena o inexistente responde
 * el mismo error "no encontrado", para no revelar que existe.
 */
export class MarcarNotificacionLeida {
  constructor(
    private readonly repositorio: RepositorioNotificaciones,
    private readonly profesores: ConsultaProfesores,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(usuarioId: string, id: string): Promise<void> {
    const profesorId = await this.profesores.profesorDeUsuario(usuarioId);
    const notificacion = await this.repositorio.buscarPorId(id);
    if (
      notificacion === null ||
      profesorId === null ||
      notificacion.datos.profesorId !== profesorId
    ) {
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Notificación no encontrada', 'no-encontrado');
    }
    notificacion.marcarLeida(this.reloj.ahora());
    await this.repositorio.guardar(notificacion);
  }
}
