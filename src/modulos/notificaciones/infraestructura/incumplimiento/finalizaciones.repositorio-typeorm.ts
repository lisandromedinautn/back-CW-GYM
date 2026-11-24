import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntrenamientoDelAlumno } from '../../dominio/incumplimiento/racha-incumplimiento.js';
import type { RepositorioFinalizaciones } from '../../dominio/incumplimiento/repositorio-finalizaciones.puerto.js';
import { FinalizacionEsquema } from './finalizacion.esquema.js';

@Injectable()
export class RepositorioFinalizacionesTypeorm implements RepositorioFinalizaciones {
  constructor(
    @InjectRepository(FinalizacionEsquema)
    private readonly filas: Repository<FinalizacionEsquema>,
  ) {}

  /** Idempotente: si el Entrenamiento ya estaba registrado, el conflicto se ignora. */
  async registrar(alumnoId: string, entrenamiento: EntrenamientoDelAlumno): Promise<void> {
    await this.filas
      .createQueryBuilder()
      .insert()
      .values({
        entrenamientoId: entrenamiento.entrenamientoId,
        alumnoId,
        fecha: new Date(entrenamiento.fecha),
        rutina: entrenamiento.rutina,
        porDebajo: entrenamiento.porDebajo,
      })
      .orIgnore()
      .execute();
  }

  async deAlumno(alumnoId: string): Promise<EntrenamientoDelAlumno[]> {
    const filas = await this.filas.find({ where: { alumnoId }, order: { fecha: 'ASC' } });
    return filas.map((f) => ({
      entrenamientoId: f.entrenamientoId,
      estado: 'finalizado',
      fecha: f.fecha.toISOString(),
      rutina: f.rutina,
      porDebajo: f.porDebajo,
    }));
  }
}
