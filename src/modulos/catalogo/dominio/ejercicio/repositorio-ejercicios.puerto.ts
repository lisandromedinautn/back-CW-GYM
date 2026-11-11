import type { Ejercicio } from './ejercicio.entidad.js';
import type { FiltrosEjercicios } from './filtros-ejercicios.js';

/** Puerto del catálogo. Clase abstracta para que también sirva de token de inyección en Nest. */
export abstract class RepositorioEjercicios {
  abstract guardar(ejercicio: Ejercicio): Promise<void>;
  abstract existePorIdDataset(idDataset: string): Promise<boolean>;
  abstract existePorNombre(nombre: string): Promise<boolean>;
  /** Todos los ejercicios del catálogo, sin orden garantizado. */
  abstract listar(): Promise<Ejercicio[]>;

  /**
   * El ejercicio con ese id, o null si no existe. La implementación por defecto recorre
   * `listar()`; el repositorio TypeORM la reemplaza por una consulta directa.
   */
  async buscarPorId(id: string): Promise<Ejercicio | null> {
    return (await this.listar()).find((ejercicio) => ejercicio.id === id) ?? null;
  }

  /**
   * T06/T07: una página de ejercicios que cumplen todos los filtros (Y), ordenados por nombre
   * ascendente. `pagina` arranca en 1. La implementación por defecto filtra `listar()` en
   * memoria; el repositorio TypeORM la reemplaza por una consulta SQL.
   */
  async consultar(
    filtros: FiltrosEjercicios,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Ejercicio[]; total: number }> {
    const busqueda = filtros.busqueda?.toLowerCase();
    const coincidentes = (await this.listar())
      .filter(
        (e) =>
          (busqueda === undefined || e.nombre.toLowerCase().includes(busqueda)) &&
          (filtros.grupoMuscular === undefined ||
            e.musculoPrincipal.grupo === filtros.grupoMuscular) &&
          (filtros.musculo === undefined || e.musculoPrincipal.nombre === filtros.musculo) &&
          (filtros.tipo === undefined || e.tipo.valor === filtros.tipo) &&
          (filtros.tipoCarga === undefined || e.tipoCarga.valor === filtros.tipoCarga),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'en'));
    const inicio = (pagina - 1) * tamanio;
    return { items: coincidentes.slice(inicio, inicio + tamanio), total: coincidentes.length };
  }
}
