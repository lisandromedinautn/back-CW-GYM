import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

// RN-IDE-06: documento único (tipo + número).
@Entity('alumnos')
@Unique('uq_alumnos_documento', ['tipoDocumento', 'numeroDocumento'])
export class AlumnoEsquema {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid', unique: true })
  usuarioId: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 200 })
  domicilio: string;

  @Column({ name: 'tipo_documento', type: 'varchar', length: 20 })
  tipoDocumento: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 30 })
  numeroDocumento: string;

  @Column({ name: 'altura_cm', type: 'double precision' })
  alturaCm: number;

  // RN-IDE-07: sin historial, una sola columna que se sobrescribe.
  @Column({ name: 'peso_kg', type: 'double precision' })
  pesoKg: number;

  @Column({ type: 'integer' })
  edad: number;

  @Column({ name: 'profesor_id', type: 'uuid', nullable: true })
  profesorId: string | null;
}
