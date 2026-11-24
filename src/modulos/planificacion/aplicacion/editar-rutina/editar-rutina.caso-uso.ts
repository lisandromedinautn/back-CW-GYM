import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { ConsultaEjercicios } from '../../dominio/rutina/consulta-ejercicios.puerto.js';
import { NombreRutina } from '../../dominio/rutina/nombre-rutina.valor.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { type PedidoRutina, resolverContenido } from '../crear-rutina/crear-rutina.caso-uso.js';

/**
 * US06: el profesor edita el contenido de una de sus rutinas (RN-PLAN-07 y 08). El contenido
 * cumple las reglas de crear (RN-PLAN-01 a 06, 20) y el nombre, RN-PLAN-21.
 */
export class EditarRutina {
  constructor(
    private readonly rutinas: RepositorioRutinas,
    private readonly ejercicios: ConsultaEjercicios,
  ) {}

  async ejecutar(
    profesorUsuarioId: string,
    rutinaId: string,
    pedido: PedidoRutina,
  ): Promise<Rutina> {
    const rutina = await this.rutinas.buscarPorId(rutinaId);
    if (!rutina || rutina.profesorUsuarioId !== profesorUsuarioId) {
      throw new ErrorDominio('RN-PLAN-08', 'La rutina no existe', 'no-encontrado');
    }
    const contenido = await resolverContenido(this.ejercicios, pedido);
    if (pedido.nombre !== undefined) {
      const nuevo = NombreRutina.crear(pedido.nombre);
      const existentes = await this.rutinas.listarNombresPorProfesor(profesorUsuarioId);
      if (existentes.some((otra) => otra.id !== rutina.id && nuevo.equivale(otra.nombre))) {
        throw new ErrorDominio('RN-PLAN-21', 'Ya tenés una rutina con ese nombre', 'conflicto');
      }
    }
    const editada = rutina.editar({ ...contenido, nombre: pedido.nombre });
    await this.rutinas.guardar(editada);
    return editada;
  }
}
