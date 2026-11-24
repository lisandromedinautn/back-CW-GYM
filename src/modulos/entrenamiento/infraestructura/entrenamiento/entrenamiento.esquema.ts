import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';
import type { ResumenEntrenamiento } from '../../dominio/entrenamiento/resumen-entrenamiento.js';
import type { CopiaRutina } from '../../dominio/entrenamiento/copia-rutina.valor.js';
import type { DatosPercepcion } from '../../dominio/percepcion/percepcion.valor.js';

export const INICIO_UNICO_POR_DIA = 'uq_entrenamientos_alumno_fecha';

@Entity('entrenamientos')
@Unique(INICIO_UNICO_POR_DIA, ['alumnoId', 'fecha'])
export class EntrenamientoEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'alumno_id', type: 'uuid' })
  alumnoId!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'timestamptz' })
  inicio!: Date;

  @Column({ name: 'peso_corporal_kg', type: 'double precision' })
  pesoCorporalKg!: number;

  @Column({ type: 'jsonb' })
  rutina!: CopiaRutina;

  @Column({ type: 'timestamptz', nullable: true })
  fin!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  resumen!: ResumenEntrenamiento | null;

  @Column({ type: 'jsonb', nullable: true })
  percepcion!: DatosPercepcion | null;
}
