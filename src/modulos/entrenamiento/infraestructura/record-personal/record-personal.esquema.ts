import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

export const RECORD_UNICO_POR_ALUMNO_EJERCICIO_TIPO = 'uq_records_personales_alumno_ejercicio_tipo';

@Entity('records_personales')
@Unique(RECORD_UNICO_POR_ALUMNO_EJERCICIO_TIPO, ['alumnoId', 'ejercicioId', 'tipo'])
export class RecordPersonalEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'alumno_id', type: 'uuid' })
  alumnoId!: string;

  @Column({ name: 'ejercicio_id', type: 'uuid' })
  ejercicioId!: string;

  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'double precision' })
  valor!: number;

  @Column({ name: 'entrenamiento_id', type: 'uuid' })
  entrenamientoId!: string;

  @Column({ type: 'date' })
  fecha!: string;
}
