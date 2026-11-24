import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

/** US21. RN-NOT-03: cantidad de notificaciones no leídas del profesor (0 si no es profesor). */
export class ContarNoLeidas {
  constructor(
    private readonly repositorio: RepositorioNotificaciones,
    private readonly profesores: ConsultaProfesores,
  ) {}

  async ejecutar(usuarioId: string): Promise<{ cantidad: number }> {
    const profesorId = await this.profesores.profesorDeUsuario(usuarioId);
    if (profesorId === null) return { cantidad: 0 };
    return { cantidad: await this.repositorio.contarNoLeidas(profesorId) };
  }
}
