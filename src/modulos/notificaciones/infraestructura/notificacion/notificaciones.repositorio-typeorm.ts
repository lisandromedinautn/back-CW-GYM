import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { Pagina } from '../../../../compartido/dominio/paginacion/paginacion.js';
import type { Notificacion } from '../../dominio/notificacion/notificacion.entidad.js';
import type { RepositorioNotificaciones } from '../../dominio/notificacion/repositorio-notificaciones.puerto.js';
import { NotificacionEsquema } from './notificacion.esquema.js';
import { filaANotificacion, notificacionAFila } from './notificacion.mapper.js';

@Injectable()
export class RepositorioNotificacionesTypeorm implements RepositorioNotificaciones {
  constructor(
    @InjectRepository(NotificacionEsquema)
    private readonly filas: Repository<NotificacionEsquema>,
  ) {}

  /**
   * Upsert por id. Si un evento duplicado concurrente ya guardó una notificación del mismo
   * Entrenamiento (índice único), el conflicto se ignora: RN-NOT-01 pide como máximo una.
   */
  async guardar(notificacion: Notificacion): Promise<void> {
    const fila = notificacionAFila(notificacion);
    if (await this.filas.existsBy({ id: fila.id })) {
      await this.filas.update({ id: fila.id }, fila);
      return;
    }
    await this.filas.createQueryBuilder().insert().values(fila).orIgnore().execute();
  }

  async buscarPorId(id: string): Promise<Notificacion | null> {
    const fila = await this.filas.findOneBy({ id });
    return fila ? filaANotificacion(fila) : null;
  }

  existeParaEntrenamiento(entrenamientoId: string): Promise<boolean> {
    return this.filas.existsBy({ entrenamientoId });
  }

  async listarDeProfesor(
    profesorId: string,
    pagina: number,
    tamanio: number,
  ): Promise<Pagina<Notificacion>> {
    const [filas, total] = await this.filas.findAndCount({
      where: { profesorId },
      order: { creada: 'DESC' },
      skip: (pagina - 1) * tamanio,
      take: tamanio,
    });
    return { items: filas.map(filaANotificacion), total, pagina, tamanio };
  }

  contarNoLeidas(profesorId: string): Promise<number> {
    return this.filas.countBy({ profesorId, leidaEn: IsNull() });
  }
}
