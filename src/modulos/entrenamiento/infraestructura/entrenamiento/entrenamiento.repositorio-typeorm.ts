import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, QueryFailedError, Repository } from 'typeorm';
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

  async guardarSerie(entrenamientoId: string, serie: SerieRealizada): Promise<void> {
    await this.seriesFilas.upsert(serieAFila(entrenamientoId, serie), [
      'entrenamientoId',
      'orden',
      'numero',
      'posicion',
    ]);
  }

  private async hidratar(fila: EntrenamientoEsquema): Promise<Entrenamiento> {
    const series = await this.seriesFilas.find({
      where: { entrenamientoId: fila.id },
      order: { orden: 'ASC', numero: 'ASC', posicion: 'ASC' },
    });
    return filaAEntrenamiento(fila, series);
  }
}
