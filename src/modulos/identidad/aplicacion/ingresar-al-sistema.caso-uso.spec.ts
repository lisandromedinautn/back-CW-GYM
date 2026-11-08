import { beforeEach, describe, expect, it } from 'vitest';
import {
  EmisorTokensFalso,
  HasheadorFalso,
  RepositorioUsuariosEnMemoria,
} from '../../../../test/dobles/identidad.js';
import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { Rol } from '../dominio/rol.valor.js';
import { Usuario } from '../dominio/usuario.entidad.js';
import { IngresarAlSistema } from './ingresar-al-sistema.caso-uso.js';

describe('RN-IDE-01 · se ingresa con email y contraseña y se recibe un JWT con el rol; sin decir qué dato falló', () => {
  let ingresar: IngresarAlSistema;

  beforeEach(async () => {
    const usuarios = new RepositorioUsuariosEnMemoria();
    await usuarios.guardar(
      Usuario.reconstruir({
        id: 'u-1',
        email: 'admin@cwgym.test',
        hashContrasenia: 'hash(Admin1234)',
        rol: Rol.desde('Admin'),
      }),
    );
    ingresar = new IngresarAlSistema(usuarios, new HasheadorFalso(), new EmisorTokensFalso());
  });

  it('con admin@cwgym.test / Admin1234 devuelve un token con sub u-1 y rol Admin', async () => {
    const resultado = await ingresar.ejecutar({
      email: 'admin@cwgym.test',
      contrasenia: 'Admin1234',
    });

    expect(resultado).toEqual({ token: 'token:u-1:Admin', rol: 'Admin' });
  });

  it('con la contraseña incorrecta rechaza con RN-IDE-01 "Email o contraseña incorrectos"', async () => {
    await expect(
      ingresar.ejecutar({ email: 'admin@cwgym.test', contrasenia: 'Otra1234' }),
    ).rejects.toThrow(
      expect.objectContaining({
        constructor: ErrorDominio,
        codigo: 'RN-IDE-01',
        message: 'Email o contraseña incorrectos',
      }),
    );
  });

  it('con un email inexistente rechaza con el mismo código y el mismo texto', async () => {
    await expect(
      ingresar.ejecutar({ email: 'nadie@cwgym.test', contrasenia: 'Admin1234' }),
    ).rejects.toThrow(
      expect.objectContaining({
        constructor: ErrorDominio,
        codigo: 'RN-IDE-01',
        message: 'Email o contraseña incorrectos',
      }),
    );
  });
});
