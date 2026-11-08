import { beforeEach, describe, expect, it } from 'vitest';
import { HasheadorFalso, RepositorioUsuariosEnMemoria } from '../../../../test/dobles/identidad.js';
import { Rol } from '../dominio/rol.valor.js';
import { Usuario } from '../dominio/usuario.entidad.js';
import { SembrarAdmin } from './sembrar-admin.caso-uso.js';

describe('RN-IDE-14 · el Admin inicial se crea con un seed idempotente tomado de ADMIN_EMAIL y ADMIN_PASSWORD', () => {
  let usuarios: RepositorioUsuariosEnMemoria;
  const hasheador = new HasheadorFalso();

  beforeEach(() => {
    usuarios = new RepositorioUsuariosEnMemoria();
  });

  const semilla = (config: { email?: string; contrasenia?: string }) =>
    new SembrarAdmin(usuarios, hasheador, config);

  it('con admin@cwgym.test / Admin1234 en una base vacía crea un único usuario con rol Admin', async () => {
    await semilla({ email: 'admin@cwgym.test', contrasenia: 'Admin1234' }).ejecutar();

    expect(usuarios.usuarios.map((u) => [u.email, u.rol.valor])).toEqual([
      ['admin@cwgym.test', 'Admin'],
    ]);
  });

  it('guarda la contraseña hasheada: hash(Admin1234), no Admin1234', async () => {
    await semilla({ email: 'admin@cwgym.test', contrasenia: 'Admin1234' }).ejecutar();

    expect(usuarios.usuarios[0]?.hashContrasenia).toBe('hash(Admin1234)');
  });

  it('ejecutarlo dos veces deja un solo usuario', async () => {
    const admin = semilla({ email: 'admin@cwgym.test', contrasenia: 'Admin1234' });
    await admin.ejecutar();
    await admin.ejecutar();

    expect(usuarios.usuarios).toHaveLength(1);
  });

  it('si ya existe un usuario con ese email y hash H1, no lo modifica', async () => {
    await usuarios.guardar(
      Usuario.reconstruir({
        id: 'u-1',
        email: 'admin@cwgym.test',
        hashContrasenia: 'H1',
        rol: Rol.desde('Admin'),
      }),
    );

    await semilla({ email: 'admin@cwgym.test', contrasenia: 'Admin1234' }).ejecutar();

    expect(usuarios.usuarios.map((u) => [u.id, u.hashContrasenia])).toEqual([['u-1', 'H1']]);
  });

  it('sin ADMIN_EMAIL falla con "Falta la variable de entorno ADMIN_EMAIL"', async () => {
    await expect(semilla({ contrasenia: 'Admin1234' }).ejecutar()).rejects.toThrow(
      'Falta la variable de entorno ADMIN_EMAIL',
    );
  });

  it('sin ADMIN_PASSWORD falla con "Falta la variable de entorno ADMIN_PASSWORD"', async () => {
    await expect(semilla({ email: 'admin@cwgym.test' }).ejecutar()).rejects.toThrow(
      'Falta la variable de entorno ADMIN_PASSWORD',
    );
  });
});
