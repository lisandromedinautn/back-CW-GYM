import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { ConsultaEjercicios } from '../../dominio/rutina/consulta-ejercicios.puerto.js';
import type { EjercicioDelCatalogo } from '../../dominio/rutina/ejercicio-del-catalogo.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import { NombreRutina } from '../../dominio/rutina/nombre-rutina.valor.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';

/** Un bloque tal como llega del profesor: el ejercicio se referencia por id (RN-PLAN-06). */
export interface PedidoBloque {
  ejercicioId: string;
  series: number;
  micropausaSegundos: number;
  macropausaSegundos: number;
  repeticiones?: number | null;
  segundos?: number | null;
  pesoKg?: number | null;
}

/** Un ejercicio de un circuito: sin series ni pausas propias (RN-PLAN-03). */
export interface PedidoEjercicioCircuito {
  ejercicioId: string;
  repeticiones?: number | null;
  segundos?: number | null;
  pesoKg?: number | null;
}

export interface PedidoCircuito {
  vueltas: number;
  macropausaSegundos: number;
  ejercicios: PedidoEjercicioCircuito[];
}

/** US06 y US09: bloques y circuitos llegan en listas separadas, las dos opcionales. */
export interface PedidoRutina {
  /** RN-PLAN-21. Si falta, la rutina se llama "Rutina N". */
  nombre?: string;
  bloques?: PedidoBloque[];
  circuitos?: PedidoCircuito[];
}

/** US06 y US09: el profesor crea una rutina por bloques y/o por circuitos. */
export class CrearRutina {
  constructor(
    private readonly rutinas: RepositorioRutinas,
    private readonly ejercicios: ConsultaEjercicios,
  ) {}

  async ejecutar(profesorUsuarioId: string, pedido: PedidoRutina): Promise<Rutina> {
    const bloques = await Promise.all(
      (pedido.bloques ?? []).map(async ({ ejercicioId, ...resto }) => ({
        ...resto,
        ejercicio: await this.buscarEjercicio(ejercicioId),
      })),
    );
    const circuitos = await Promise.all(
      (pedido.circuitos ?? []).map(async ({ ejercicios, ...resto }) => ({
        ...resto,
        ejercicios: await Promise.all(
          ejercicios.map(async ({ ejercicioId, ...objetivo }) => ({
            ...objetivo,
            ejercicio: await this.buscarEjercicio(ejercicioId),
          })),
        ),
      })),
    );
    const nombre = await this.resolverNombre(profesorUsuarioId, pedido.nombre);
    const rutina = Rutina.crear({ profesorUsuarioId, nombre, bloques, circuitos });
    await this.rutinas.guardar(rutina);
    return rutina;
  }

  /**
   * RN-PLAN-21: con nombre, no puede repetir el de otra rutina del profesor (409). Sin nombre,
   * "Rutina N" con N = rutinas del profesor + 1, o el siguiente N libre.
   */
  private async resolverNombre(profesorUsuarioId: string, pedido?: string): Promise<string> {
    const existentes = await this.rutinas.listarNombresPorProfesor(profesorUsuarioId);
    if (pedido !== undefined) {
      const nombre = NombreRutina.crear(pedido);
      if (existentes.some((existente) => nombre.equivale(existente.nombre))) {
        throw new ErrorDominio('RN-PLAN-21', 'Ya tenés una rutina con ese nombre', 'conflicto');
      }
      return nombre.valor;
    }
    let numero = existentes.length + 1;
    while (
      existentes.some(({ nombre }) => NombreRutina.crear(`Rutina ${numero}`).equivale(nombre))
    ) {
      numero += 1;
    }
    return `Rutina ${numero}`;
  }

  /** RN-PLAN-06: el ejercicio referenciado tiene que existir en el catálogo. */
  private async buscarEjercicio(id: string): Promise<EjercicioDelCatalogo> {
    const ejercicio = await this.ejercicios.buscarPorId(id);
    if (!ejercicio) {
      throw new ErrorDominio(
        'RN-PLAN-06',
        `El ejercicio ${id} no existe en el catálogo`,
        'no-encontrado',
      );
    }
    return ejercicio;
  }
}
