import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioEsquema {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  // RN-IDE-13: el email es único entre todos los usuarios.
  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ name: 'hash_contrasenia', type: 'varchar', length: 100 })
  hashContrasenia: string;

  @Column({ type: 'varchar', length: 20 })
  rol: string;
}
