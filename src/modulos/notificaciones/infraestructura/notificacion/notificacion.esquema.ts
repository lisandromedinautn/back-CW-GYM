import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { SeriePorDebajo } from '../../dominio/notificacion/serie-por-debajo.valor.js';
import type { Percepcion } from '../../dominio/notificacion/percepcion.valor.js';

/** Lo que se guarda en `detalle`: todo lo que la bandeja muestra además de las columnas. */
export interface DetalleNotificacion {
  alumno: { id: string; nombre: string; apellido: string };
  entrenamiento: { id: string; rutina: string; inicio: string };
  totalSeries: number;
  seriesPorDebajo: SeriePorDebajo[];
}

@Entity('notificaciones')
@Index('idx_notificaciones_profesor_creada', ['profesorId', 'creada'])
export class NotificacionEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'profesor_id', type: 'uuid' })
  profesorId!: string;

  @Column({ name: 'alumno_id', type: 'uuid' })
  alumnoId!: string;

  /** RN-NOT-01: un Entrenamiento genera como máximo una notificación. */
  @Index('uq_notificaciones_entrenamiento', { unique: true })
  @Column({ name: 'entrenamiento_id', type: 'uuid' })
  entrenamientoId!: string;

  @Column({ type: 'timestamptz' })
  creada!: Date;

  @Column({ name: 'leida_en', type: 'timestamptz', nullable: true })
  leidaEn!: Date | null;

  @Column({ type: 'varchar' })
  gravedad!: string;

  @Column({ type: 'jsonb' })
  detalle!: DetalleNotificacion;

  @Column({ type: 'jsonb', nullable: true })
  percepcion!: Percepcion | null;
}
