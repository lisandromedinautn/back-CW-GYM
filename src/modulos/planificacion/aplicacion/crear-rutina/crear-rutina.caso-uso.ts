import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { ConsultaEjercicios } from '../../dominio/rutina/consulta-ejercicios.puerto.js';
import type { EjercicioDelCatalogo } from '../../dominio/rutina/ejercicio-del-catalogo.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
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

export interface PedidoRutina {
  bloques: PedidoBloque[];
}

/** US06: el profesor crea una rutina por bloques. */
export class CrearRutina {
  constructor(
    private readonly rutinas: RepositorioRutinas,
    private readonly ejercicios: ConsultaEjercicios,
  ) {}

  async ejecutar(profesorUsuarioId: string, pedido: PedidoRutina): Promise<Rutina> {
    const bloques = await Promise.all(
      pedido.bloques.map(async ({ ejercicioId, ...resto }) => ({
        ...resto,
        ejercicio: await this.buscarEjercicio(ejercicioId),
      })),
    );
    const rutina = Rutina.crear({ profesorUsuarioId, bloques });
    await this.rutinas.guardar(rutina);
    return rutina;
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
