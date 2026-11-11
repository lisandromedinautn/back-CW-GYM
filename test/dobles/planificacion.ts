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

  /** Más nuevas primero: en memoria, las últimas guardadas. Devuelve { items, total }. */
  async listarPorProfesor(
    profesorUsuarioId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Rutina[]; total: number }> {
    const delProfesor = this.rutinas
      .filter((rutina) => rutina.profesorUsuarioId === profesorUsuarioId)
      .reverse();
    const inicio = (pagina - 1) * tamanio;
    return { items: delProfesor.slice(inicio, inicio + tamanio), total: delProfesor.length };
  }

  /** Todas las rutinas de todos los profesores, de la más vieja a la más nueva (orden de inserción). */
  async listarTodasPorAntiguedad(): Promise<Rutina[]> {
    return this.rutinas;
  }

  /** Nombres de las rutinas del profesor, para detectar duplicados (RN-PLAN-21). */
  async listarNombresPorProfesor(
    profesorUsuarioId: string,
  ): Promise<{ id: string; nombre: string }[]> {
    return this.rutinas
      .filter((rutina) => rutina.profesorUsuarioId === profesorUsuarioId)
      .map((rutina) => ({ id: rutina.id, nombre: rutina.nombre }));
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
