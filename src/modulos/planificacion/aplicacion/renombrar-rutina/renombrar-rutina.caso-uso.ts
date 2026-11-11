import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { NombreRutina } from '../../dominio/rutina/nombre-rutina.valor.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';

/** T09: el profesor renombra una de sus rutinas. RN-PLAN-21 (nombre) y RN-PLAN-08 (solo las suyas). */
export class RenombrarRutina {
  constructor(private readonly rutinas: RepositorioRutinas) {}

  async ejecutar(profesorUsuarioId: string, rutinaId: string, nombre: string): Promise<Rutina> {
    const rutina = await this.rutinas.buscarPorId(rutinaId);
    if (!rutina || rutina.profesorUsuarioId !== profesorUsuarioId) {
      throw new ErrorDominio('RN-PLAN-08', 'La rutina no existe', 'no-encontrado');
    }
    const nuevo = NombreRutina.crear(nombre);
    const existentes = await this.rutinas.listarNombresPorProfesor(profesorUsuarioId);
    if (existentes.some((otra) => otra.id !== rutina.id && nuevo.equivale(otra.nombre))) {
      throw new ErrorDominio('RN-PLAN-21', 'Ya tenés una rutina con ese nombre', 'conflicto');
    }
    rutina.renombrar(nuevo.valor);
    await this.rutinas.guardar(rutina);
    return rutina;
  }
}
