import type { Pagina } from '../../src/compartido/dominio/paginacion/paginacion.js';
import { ConsultaProfesores } from '../../src/modulos/notificaciones/dominio/notificacion/consulta-profesores.puerto.js';
import { Notificacion } from '../../src/modulos/notificaciones/dominio/notificacion/notificacion.entidad.js';
import type { EntrenamientoDelAlumno } from '../../src/modulos/notificaciones/dominio/incumplimiento/racha-incumplimiento.js';
import { RepositorioFinalizaciones } from '../../src/modulos/notificaciones/dominio/incumplimiento/repositorio-finalizaciones.puerto.js';
import { RepositorioNotificaciones } from '../../src/modulos/notificaciones/dominio/notificacion/repositorio-notificaciones.puerto.js';

/** Repositorio en memoria: ordena por `creada` descendente, pagina y cuenta no leídas. */
export class RepositorioNotificacionesEnMemoria extends RepositorioNotificaciones {
  private readonly porId = new Map<string, Notificacion>();

  async guardar(notificacion: Notificacion): Promise<void> {
    this.porId.set(notificacion.datos.id, Notificacion.reconstruir(notificacion.datos));
  }

  async buscarPorId(id: string): Promise<Notificacion | null> {
    const guardada = this.porId.get(id);
    return guardada ? Notificacion.reconstruir(guardada.datos) : null;
  }

  async existeParaEntrenamiento(entrenamientoId: string): Promise<boolean> {
    return this.todas().some(
      (n) => n.datos.tipo === 'entrenamiento' && n.datos.entrenamiento.id === entrenamientoId,
    );
  }

  async existeAlertaParaEntrenamiento(entrenamientoId: string): Promise<boolean> {
    return this.todas().some(
      (n) =>
        n.datos.tipo === 'alerta-incumplimiento' && n.datos.entrenamiento.id === entrenamientoId,
    );
  }

  async buscarPorEntrenamiento(entrenamientoId: string): Promise<Notificacion | null> {
    const encontrada = this.todas().find(
      (n) => n.datos.tipo === 'entrenamiento' && n.datos.entrenamiento.id === entrenamientoId,
    );
    return encontrada ? Notificacion.reconstruir(encontrada.datos) : null;
  }

  async listarDeProfesor(
    profesorId: string,
    pagina: number,
    tamanio: number,
  ): Promise<Pagina<Notificacion>> {
    const propias = this.todas()
      .filter((n) => n.datos.profesorId === profesorId)
      .sort((a, b) => b.datos.creada.localeCompare(a.datos.creada));
    return {
      items: propias.slice((pagina - 1) * tamanio, pagina * tamanio),
      total: propias.length,
      pagina,
      tamanio,
    };
  }

  async contarNoLeidas(profesorId: string): Promise<number> {
    return this.todas().filter((n) => n.datos.profesorId === profesorId && !n.leida).length;
  }

  /** Para las aserciones de los tests. */
  todas(): Notificacion[] {
    return [...this.porId.values()];
  }
}

/** Consulta de profesores con mapas fijos: alumno → profesor y usuario → profesor. */
export class ConsultaProfesoresFija extends ConsultaProfesores {
  constructor(
    private readonly alumnos: Record<
      string,
      { profesorId: string; alumno: { id: string; nombre: string; apellido: string } }
    >,
    private readonly usuarios: Record<string, string>,
  ) {
    super();
  }

  async profesorDelAlumno(alumnoId: string) {
    return this.alumnos[alumnoId] ?? null;
  }

  async profesorDeUsuario(usuarioId: string): Promise<string | null> {
    return this.usuarios[usuarioId] ?? null;
  }
}

/** Registro de finalizados en memoria: idempotente por Entrenamiento. */
export class RepositorioFinalizacionesEnMemoria extends RepositorioFinalizaciones {
  private readonly porAlumno = new Map<string, Map<string, EntrenamientoDelAlumno>>();

  async registrar(alumnoId: string, entrenamiento: EntrenamientoDelAlumno): Promise<void> {
    const propios = this.porAlumno.get(alumnoId) ?? new Map<string, EntrenamientoDelAlumno>();
    propios.set(entrenamiento.entrenamientoId, { ...entrenamiento });
    this.porAlumno.set(alumnoId, propios);
  }

  async deAlumno(alumnoId: string): Promise<EntrenamientoDelAlumno[]> {
    return [...(this.porAlumno.get(alumnoId)?.values() ?? [])].map((e) => ({ ...e }));
  }
}
