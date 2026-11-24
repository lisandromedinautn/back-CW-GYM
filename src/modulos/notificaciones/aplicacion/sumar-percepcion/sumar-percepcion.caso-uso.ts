import { randomUUID } from 'node:crypto';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaProfesores } from '../../dominio/notificacion/consulta-profesores.puerto.js';
import { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { PercepcionRegistradaRecibida } from '../../dominio/notificacion/percepcion-registrada-recibida.js';
import { Percepcion } from '../../dominio/notificacion/percepcion.valor.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';

/**
 * US17. Escucha PercepcionRegistrada. RN-NOT-05: si el Entrenamiento ya tiene notificación, suma
 * la percepción. RN-NOT-01, 06: si no, y la percepción es mala, crea una para el profesor del alumno.
 */
export class SumarPercepcion {
  constructor(
    private readonly repositorio: RepositorioNotificaciones,
    private readonly profesores: ConsultaProfesores,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(evento: PercepcionRegistradaRecibida): Promise<void> {
    const percepcion = Percepcion.crear(evento.percepcion);
    const existente = await this.repositorio.buscarPorEntrenamiento(evento.entrenamientoId);
    if (existente !== null) {
      existente.sumarPercepcion(percepcion);
      await this.repositorio.guardar(existente);
      return;
    }
    if (!percepcion.esMala()) return;
    const vinculo = await this.profesores.profesorDelAlumno(evento.alumnoId);
    if (vinculo === null) return;
    await this.repositorio.guardar(
      Notificacion.crearPorPercepcion({
        id: randomUUID(),
        profesorId: vinculo.profesorId,
        alumno: vinculo.alumno,
        entrenamiento: { id: evento.entrenamientoId, rutina: evento.rutina, inicio: evento.inicio },
        totalSeries: evento.totalSeries,
        creada: this.reloj.ahora().toISOString(),
        percepcion,
      }),
    );
  }
}
