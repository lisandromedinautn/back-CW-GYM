// Dobles de los puertos de planificación para los tests unitarios (docs/TESTING.md: se mockea
// solo en los bordes). Viven fuera de src/ para no contar en la cobertura.
import { ConsultaEjercicios } from '../../src/modulos/planificacion/dominio/rutina/consulta-ejercicios.puerto.js';
import type { EjercicioDelCatalogo } from '../../src/modulos/planificacion/dominio/rutina/ejercicio-del-catalogo.js';
import { RepositorioRutinas } from '../../src/modulos/planificacion/dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../src/modulos/planificacion/dominio/rutina/rutina.entidad.js';

export class RepositorioRutinasEnMemoria extends RepositorioRutinas {
  readonly rutinas: Rutina[] = [];

  async guardar(rutina: Rutina): Promise<void> {
    const indice = this.rutinas.findIndex((existente) => existente.id === rutina.id);
    if (indice === -1) this.rutinas.push(rutina);
    else this.rutinas[indice] = rutina;
  }

  async buscarPorId(id: string): Promise<Rutina | null> {
    return this.rutinas.find((rutina) => rutina.id === id) ?? null;
  }
}

/** Catálogo fijo: solo existen los ejercicios que se le pasan. */
export class ConsultaEjerciciosFalsa extends ConsultaEjercicios {
  constructor(private readonly ejercicios: EjercicioDelCatalogo[]) {
    super();
  }

  async buscarPorId(id: string): Promise<EjercicioDelCatalogo | null> {
    return this.ejercicios.find((ejercicio) => ejercicio.id === id) ?? null;
  }
}
