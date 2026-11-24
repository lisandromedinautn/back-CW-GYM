import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import type { DatosNotificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

export type NotificacionConsultada = DatosNotificacion & { leida: boolean };

export type BandejaNotificaciones = Pagina<NotificacionConsultada> & { noLeidas: number };

/**
 * US21. RN-NOT-03: el profesor ve solo sus notificaciones, de la más nueva a la más vieja,
 * paginadas y con la cantidad de no leídas. Un usuario que no es profesor ve la bandeja vacía.
 */
export class ConsultarNotificaciones {
  constructor(
    private readonly repositorio: RepositorioNotificaciones,
    private readonly profesores: ConsultaProfesores,
  ) {}

  async ejecutar(
    usuarioId: string,
    { pagina = 1, tamanio = 10 }: { pagina?: number; tamanio?: number } = {},
  ): Promise<BandejaNotificaciones> {
    const profesorId = await this.profesores.profesorDeUsuario(usuarioId);
    if (profesorId === null) return { items: [], total: 0, pagina, tamanio, noLeidas: 0 };
    const resultado = await this.repositorio.listarDeProfesor(profesorId, pagina, tamanio);
    return {
      items: resultado.items.map((n) => ({ ...n.datos, leida: n.leida })),
      total: resultado.total,
      pagina,
      tamanio,
      noLeidas: await this.repositorio.contarNoLeidas(profesorId),
    };
  }
}
