import { Rol } from '../../dominio/rol/rol.valor.js';
import { Usuario } from '../../dominio/usuario/usuario.entidad.js';
import { UsuarioEsquema } from './usuario.esquema.js';

export const UsuarioMapper = {
  aDominio(fila: UsuarioEsquema): Usuario {
    return Usuario.reconstruir({
      id: fila.id,
      email: fila.email,
      hashContrasenia: fila.hashContrasenia,
      rol: Rol.desde(fila.rol),
    });
  },

  aEsquema(usuario: Usuario): UsuarioEsquema {
    return Object.assign(new UsuarioEsquema(), {
      id: usuario.id,
      email: usuario.email,
      hashContrasenia: usuario.hashContrasenia,
      rol: usuario.rol.valor,
    });
  },
};
