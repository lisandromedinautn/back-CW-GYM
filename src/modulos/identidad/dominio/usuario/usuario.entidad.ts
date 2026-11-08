import { randomUUID } from 'node:crypto';
import type { Rol } from '../rol/rol.valor.js';

export interface DatosUsuario {
  id: string;
  email: string;
  hashContrasenia: string;
  rol: Rol;
}

/** Credenciales de ingreso de cualquier usuario (Admin, Profesor o Alumno). */
export class Usuario {
  private constructor(private readonly datos: DatosUsuario) {}

  static crear(datos: Omit<DatosUsuario, 'id'>): Usuario {
    return new Usuario({ id: randomUUID(), ...datos });
  }

  static reconstruir(datos: DatosUsuario): Usuario {
    return new Usuario({ ...datos });
  }

  get id(): string {
    return this.datos.id;
  }

  get email(): string {
    return this.datos.email;
  }

  get hashContrasenia(): string {
    return this.datos.hashContrasenia;
  }

  get rol(): Rol {
    return this.datos.rol;
  }
}
