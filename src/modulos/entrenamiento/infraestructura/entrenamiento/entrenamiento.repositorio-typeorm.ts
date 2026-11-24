import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { ResumenEntrenamiento } from '../../dominio/entrenamiento/resumen-entrenamiento.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, QueryFailedError, Repository } from 'typeorm';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import type { SerieRealizada } from '../../dominio/entrenamiento/serie-realizada.valor.js';
import { EntrenamientoEsquema, INICIO_UNICO_POR_DIA } from './entrenamiento.esquema.js';
import { filaAEntrenamiento, serieAFila } from './entrenamiento.mapper.js';
import { SerieRealizadaEsquema } from './serie-realizada.esquema.js';

@Injectable()
export class RepositorioEntrenamientosTypeorm implements RepositorioEntrenamientos {
  constructor(
    @InjectRepository(EntrenamientoEsquema)
    private readonly filas: Repository<EntrenamientoEsquema>,
    @InjectRepository(SerieRealizadaEsquema)
    private readonly seriesFilas: Repository<SerieRealizadaEsquema>,
  ) {}

  async insertar(entrenamiento: Entrenamiento): Promise<boolean> {
    const { id, alumnoId, pesoCorporalKg, rutina, inicio } = entrenamiento.datos;
    try {
      await this.filas.insert({
        id,
        alumnoId,
        pesoCorporalKg,
        rutina,
        fecha: entrenamiento.fecha,
        inicio: new Date(inicio),
      });
      return true;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const causa = error.driverError as { code?: string; constraint?: string };
        if (causa.code === '23505' && causa.constraint === INICIO_UNICO_POR_DIA) return false;
      }
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<Entrenamiento | null> {
    const fila = await this.filas.findOne({ where: { id } });
    return fila ? this.hidratar(fila) : null;
  }

  async buscarUltimo(alumnoId: string, hastaFecha: string): Promise<Entrenamiento | null> {
    const fila = await this.filas.findOne({
      where: { alumnoId, fecha: LessThanOrEqual(hastaFecha) },
      order: { fecha: 'DESC' },
    });
    return fila ? this.hidratar(fila) : null;
  }

  async listarPorAlumno(
    alumnoId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Entrenamiento[]; total: number }> {
    const [filas, total] = await this.filas.findAndCount({
      where: { alumnoId },
      order: { fecha: 'DESC' },
      skip: (pagina - 1) * tamanio,
      take: tamanio,
    });
    if (filas.length === 0) return { items: [], total };
    const series = await this.seriesFilas.find({
      where: { entrenamientoId: In(filas.map((fila) => fila.id)) },
      order: { orden: 'ASC', numero: 'ASC', posicion: 'ASC' },
    });
    const items = filas.map((fila) =>
      filaAEntrenamiento(
        fila,
        series.filter((serie) => serie.entrenamientoId === fila.id),
      ),
    );
    return { items, total };
  }

  async guardarSerie(entrenamientoId: string, serie: SerieRealizada): Promise<void> {
    await this.filas.manager.transaction(async (manager) => {
      const fila = await manager
        .getRepository(EntrenamientoEsquema)
        .findOne({ where: { id: entrenamientoId }, lock: { mode: 'pessimistic_write' } });
      if (!fila || fila.fin)
        throw new ErrorDominio('RN-ENT-04', 'El entrenamiento ya fue finalizado', 'conflicto');
      await manager
        .getRepository(SerieRealizadaEsquema)
        .upsert(serieAFila(entrenamientoId, serie), [
          'entrenamientoId',
          'orden',
          'numero',
          'posicion',
        ]);
    });
  }

  async finalizarAtomico(
    id: string,
    instante: Date,
    calcular: (entrenamiento: Entrenamiento) => Promise<ResumenEntrenamiento>,
  ): Promise<Entrenamiento | null> {
    return this.filas.manager.transaction(async (manager) => {
      const filas = manager.getRepository(EntrenamientoEsquema);
      const fila = await filas.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!fila) return null;
      const series = await manager.getRepository(SerieRealizadaEsquema).find({
        where: { entrenamientoId: id },
        order: { orden: 'ASC', numero: 'ASC', posicion: 'ASC' },
      });
      const entrenamiento = filaAEntrenamiento(fila, series);
      entrenamiento.asegurarFinalizable(instante);
      const resumen = await calcular(entrenamiento);
      entrenamiento.finalizar(instante, resumen);
      await filas.update({ id }, { fin: instante, resumen });
      return entrenamiento;
    });
  }

  private async hidratar(fila: EntrenamientoEsquema): Promise<Entrenamiento> {
    const series = await this.seriesFilas.find({
      where: { entrenamientoId: fila.id },
      order: { orden: 'ASC', numero: 'ASC', posicion: 'ASC' },
    });
    return filaAEntrenamiento(fila, series);
  }
}
