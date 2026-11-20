import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, QueryFailedError, Repository } from 'typeorm';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import { EntrenamientoEsquema, INICIO_UNICO_POR_DIA } from './entrenamiento.esquema.js';

@Injectable()
export class RepositorioEntrenamientosTypeorm implements RepositorioEntrenamientos {
  constructor(
    @InjectRepository(EntrenamientoEsquema)
    private readonly filas: Repository<EntrenamientoEsquema>,
  ) {}

  async insertar(entrenamiento: Entrenamiento): Promise<boolean> {
    const datos = entrenamiento.datos;
    try {
      await this.filas.insert({
        ...datos,
        fecha: entrenamiento.fecha,
        inicio: new Date(datos.inicio),
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

  async buscarUltimo(alumnoId: string, hastaFecha: string): Promise<Entrenamiento | null> {
    const fila = await this.filas.findOne({
      where: { alumnoId, fecha: LessThanOrEqual(hastaFecha) },
      order: { fecha: 'DESC' },
    });
    if (!fila) return null;
    const { id, pesoCorporalKg, rutina, inicio } = fila;
    return Entrenamiento.reconstruir({
      id,
      alumnoId,
      pesoCorporalKg,
      rutina,
      inicio: inicio.toISOString(),
    });
  }
}
