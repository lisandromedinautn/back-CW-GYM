import type { ConsultaEjercicios } from '../dominio/consulta-ejercicios.puerto.js';
import type { RepositorioRutinas } from '../dominio/repositorio-rutinas.puerto.js';
import { Rutina } from '../dominio/rutina.entidad.js';

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

// ESQUELETO (rojo de TDD): todavía no valida que los ejercicios existan ni guarda.
export class CrearRutina {
  constructor(
    private readonly rutinas: RepositorioRutinas,
    private readonly ejercicios: ConsultaEjercicios,
  ) {}

  async ejecutar(profesorUsuarioId: string, _pedido: PedidoRutina): Promise<Rutina> {
    return Rutina.crear({ profesorUsuarioId, bloques: [] });
  }
}
