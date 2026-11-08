import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Esquema de persistencia de `Ejercicio`. No es la entidad de dominio: el mapper las traduce. */
@Entity('ejercicios')
export class EjercicioEsquema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'id_dataset', type: 'varchar', length: 20, unique: true })
  idDataset!: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ name: 'tipo_carga', type: 'varchar', length: 40 })
  tipoCarga!: string;

  @Column({ name: 'factor_peso_corporal', type: 'double precision', nullable: true })
  factorPesoCorporal!: number | null;

  @Column({ name: 'musculo_principal', type: 'varchar', length: 50 })
  musculoPrincipal!: string;

  @Column({ name: 'musculo_secundario', type: 'varchar', length: 50, nullable: true })
  musculoSecundario!: string | null;

  @Column({ name: 'url_gif', type: 'varchar', length: 300 })
  urlGif!: string;

  @Column({ type: 'varchar', length: 200 })
  atribucion!: string;
}
