import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';

/** Esquema de persistencia de `Plan`. No es la entidad de dominio: el mapper las traduce. */
@Entity('planes')
export class PlanEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  /** Usuario (rol Profesor) que creó el plan, tal como viene en el JWT. */
  @Column({ name: 'profesor_usuario_id', type: 'uuid' })
  profesorUsuarioId!: string;

  /** RN-PLAN-09: fecha de inicio y fecha de fin calculada (inicio + 27 días). */
  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  /** Solo de persistencia: ordena los planes del profesor. */
  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadaEn!: Date;

  @OneToMany(() => DiaPlanEsquema, (dia) => dia.plan, { cascade: true })
  dias!: DiaPlanEsquema[];

  @OneToMany(() => PlanAlumnoEsquema, (alumno) => alumno.plan, { cascade: true })
  alumnos!: PlanAlumnoEsquema[];
}

/** Un día del plan (RN-PLAN-10, 11). `rutinaId` null significa descanso. */
@Entity('dias_plan')
@Unique('uq_dias_plan_numero', ['planId', 'numero'])
export class DiaPlanEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => PlanEsquema, (plan) => plan.dias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEsquema;

  @Column({ type: 'integer' })
  numero!: number;

  @Column({ type: 'date' })
  fecha!: string;

  /** Id de la rutina del día (RN-PLAN-08). Sin clave foránea: las rutinas son otro agregado. */
  @Column({ name: 'rutina_id', type: 'uuid', nullable: true })
  rutinaId!: string | null;
}

/** Alumno asignado al plan (RN-PLAN-12). El id es el del alumno de Identidad. */
@Entity('plan_alumnos')
export class PlanAlumnoEsquema {
  @PrimaryColumn({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @PrimaryColumn({ name: 'alumno_id', type: 'uuid' })
  alumnoId!: string;

  @ManyToOne(() => PlanEsquema, (plan) => plan.alumnos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEsquema;
}
