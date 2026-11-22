import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { MedidaSerie } from '../../dominio/entrenamiento/serie-realizada.valor.js';
import { EntrenamientoEsquema } from './entrenamiento.esquema.js';

/** `posicion` vale 0 para las series de bloque: NULL rompería la unicidad de la clave. */
@Entity('series_realizadas')
export class SerieRealizadaEsquema {
  @PrimaryColumn({ name: 'entrenamiento_id', type: 'uuid' })
  entrenamientoId!: string;

  @PrimaryColumn({ type: 'int' })
  orden!: number;

  @PrimaryColumn({ type: 'int' })
  numero!: number;

  @PrimaryColumn({ type: 'int' })
  posicion!: number;

  @Column({ name: 'ejercicio_id', type: 'uuid' })
  ejercicioId!: string;

  @Column({ type: 'varchar' })
  nombre!: string;

  @Column({ type: 'jsonb' })
  prescripta!: MedidaSerie;

  @Column({ type: 'jsonb' })
  realizada!: MedidaSerie;

  @ManyToOne(() => EntrenamientoEsquema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entrenamiento_id' })
  entrenamiento?: EntrenamientoEsquema;
}
