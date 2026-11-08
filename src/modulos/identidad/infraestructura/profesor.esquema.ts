import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

// RN-IDE-04: legajo único. RN-IDE-06: documento único (tipo + número).
@Entity('profesores')
@Unique('uq_profesores_documento', ['tipoDocumento', 'numeroDocumento'])
export class ProfesorEsquema {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid', unique: true })
  usuarioId: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'tipo_documento', type: 'varchar', length: 20 })
  tipoDocumento: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 30 })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  legajo: string;

  // RN-IDE-08: una sola columna, así regenerar reemplaza (e invalida) el código anterior.
  @Column({ type: 'varchar', length: 6, unique: true, nullable: true })
  codigo: string | null;
}
