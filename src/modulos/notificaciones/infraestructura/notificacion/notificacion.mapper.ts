import {
  Notificacion,
  type DatosNotificacion,
} from '../../dominio/notificacion/notificacion.entidad.js';
import type { NotificacionEsquema } from './notificacion.esquema.js';

export function notificacionAFila(notificacion: Notificacion): NotificacionEsquema {
  const datos = notificacion.datos;
  return {
    id: datos.id,
    profesorId: datos.profesorId,
    alumnoId: datos.alumno.id,
    entrenamientoId: datos.entrenamiento.id,
    tipo: datos.tipo,
    creada: new Date(datos.creada),
    leidaEn: datos.leidaEn === null ? null : new Date(datos.leidaEn),
    gravedad: datos.gravedad,
    detalle: {
      alumno: datos.alumno,
      entrenamiento: datos.entrenamiento,
      totalSeries: datos.totalSeries,
      seriesPorDebajo: datos.seriesPorDebajo,
      ...(datos.entrenamientos ? { entrenamientos: datos.entrenamientos } : {}),
    },
    percepcion: datos.percepcion,
  };
}

export function filaANotificacion(fila: NotificacionEsquema): Notificacion {
  const datos: DatosNotificacion = {
    id: fila.id,
    tipo: fila.tipo as DatosNotificacion['tipo'],
    ...(fila.detalle.entrenamientos ? { entrenamientos: fila.detalle.entrenamientos } : {}),
    profesorId: fila.profesorId,
    alumno: fila.detalle.alumno,
    entrenamiento: fila.detalle.entrenamiento,
    totalSeries: fila.detalle.totalSeries,
    seriesPorDebajo: fila.detalle.seriesPorDebajo,
    gravedad: fila.gravedad as DatosNotificacion['gravedad'],
    creada: fila.creada.toISOString(),
    leidaEn: fila.leidaEn === null ? null : fila.leidaEn.toISOString(),
    percepcion: fila.percepcion,
  };
  return Notificacion.reconstruir(datos);
}
