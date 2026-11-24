import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** Entrenamiento finalizado de un alumno, tal como lo registra Notificaciones (RN-NOT-08). */
@Entity('finalizaciones_alumno')
export class FinalizacionEsquema {
  @PrimaryColumn({ name: 'entrenamiento_id', type: 'uuid' })
  entrenamientoId!: string;

  @Index('idx_finalizaciones_alumno')
  @Column({ name: 'alumno_id', type: 'uuid' })
  alumnoId!: string;

  @Column({ type: 'timestamptz' })
  fecha!: Date;

  @Column({ type: 'varchar' })
  rutina!: string;

  @Column({ name: 'por_debajo', type: 'boolean' })
  porDebajo!: boolean;
}
