import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

/** Esquema de persistencia de `Rutina`. No es la entidad de dominio: el mapper las traduce. */
@Entity('rutinas')
export class RutinaEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  /** Usuario (rol Profesor) que creó la rutina, tal como viene en el JWT. */
  @Column({ name: 'profesor_usuario_id', type: 'uuid' })
  profesorUsuarioId!: string;

  /** RN-PLAN-21. El default cubre las filas que ya existían. */
  @Column({ type: 'varchar', length: 60, default: 'Rutina 1' })
  nombre!: string;

  /** Solo de persistencia: ordena la consulta paginada (más nuevas primero). */
  @CreateDateColumn({ name: 'creada_en', type: 'timestamptz' })
  creadaEn!: Date;

  @OneToMany(() => BloqueRutinaEsquema, (bloque) => bloque.rutina, { cascade: true })
  bloques!: BloqueRutinaEsquema[];

  @OneToMany(() => CircuitoRutinaEsquema, (circuito) => circuito.rutina, { cascade: true })
  circuitos!: CircuitoRutinaEsquema[];
}

/** Un circuito de la rutina (RN-PLAN-03). No tiene micropausa. */
@Entity('circuitos_rutina')
export class CircuitoRutinaEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => RutinaEsquema, (rutina) => rutina.circuitos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rutina_id' })
  rutina!: RutinaEsquema;

  @Column({ type: 'integer' })
  orden!: number;

  @Column({ type: 'integer' })
  vueltas!: number;

  @Column({ name: 'macropausa_segundos', type: 'integer' })
  macropausaSegundos!: number;

  @OneToMany(() => EjercicioCircuitoEsquema, (ejercicio) => ejercicio.circuito, { cascade: true })
  ejercicios!: EjercicioCircuitoEsquema[];
}

/** Un ejercicio prescripto de un circuito, en su orden dentro del circuito. */
@Entity('ejercicios_circuito')
export class EjercicioCircuitoEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => CircuitoRutinaEsquema, (circuito) => circuito.ejercicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'circuito_id' })
  circuito!: CircuitoRutinaEsquema;

  @Column({ type: 'integer' })
  orden!: number;

  /** Id del ejercicio del catálogo (RN-PLAN-06). Sin clave foránea: es otro módulo. */
  @Column({ name: 'ejercicio_id', type: 'uuid' })
  ejercicioId!: string;

  @Column({ type: 'integer', nullable: true })
  repeticiones!: number | null;

  @Column({ type: 'integer', nullable: true })
  segundos!: number | null;

  @Column({ name: 'peso_kg', type: 'double precision', nullable: true })
  pesoKg!: number | null;
}

/** Un bloque de la rutina (RN-PLAN-02). `orden` conserva la secuencia (RN-PLAN-01). */
@Entity('bloques_rutina')
export class BloqueRutinaEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => RutinaEsquema, (rutina) => rutina.bloques, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rutina_id' })
  rutina!: RutinaEsquema;

  @Column({ type: 'integer' })
  orden!: number;

  /** Id del ejercicio del catálogo (RN-PLAN-06). Sin clave foránea: es otro módulo. */
  @Column({ name: 'ejercicio_id', type: 'uuid' })
  ejercicioId!: string;

  @Column({ type: 'integer' })
  series!: number;

  @Column({ name: 'micropausa_segundos', type: 'integer' })
  micropausaSegundos!: number;

  @Column({ name: 'macropausa_segundos', type: 'integer' })
  macropausaSegundos!: number;

  @Column({ type: 'integer', nullable: true })
  repeticiones!: number | null;

  @Column({ type: 'integer', nullable: true })
  segundos!: number | null;

  @Column({ name: 'peso_kg', type: 'double precision', nullable: true })
  pesoKg!: number | null;
}
