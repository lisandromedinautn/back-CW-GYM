// Dobles de los puertos de planificación para los tests unitarios (docs/TESTING.md: se mockea
// solo en los bordes). Viven fuera de src/ para no contar en la cobertura.
import { Reloj } from '../../src/compartido/dominio/reloj/reloj.puerto.js';
import { ConsultaVinculos } from '../../src/modulos/planificacion/dominio/plan/consulta-vinculos.puerto.js';
import { RepositorioPlanes } from '../../src/modulos/planificacion/dominio/plan/repositorio-planes.puerto.js';
import type { Plan } from '../../src/modulos/planificacion/dominio/plan/plan.entidad.js';
import { ConsultaEjercicios } from '../../src/modulos/planificacion/dominio/rutina/consulta-ejercicios.puerto.js';
import {
  ConsultaNombresEjercicios,
  type NombreDeEjercicio,
} from '../../src/modulos/planificacion/dominio/rutina/consulta-nombres-ejercicios.puerto.js';
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

/** Nombres del catálogo: solo los que se declaran existen (US08). */
export class ConsultaNombresEjerciciosFalsa extends ConsultaNombresEjercicios {
  constructor(private readonly nombres: Record<string, string> = {}) {
    super();
  }

  async buscarPorIds(ids: readonly string[]): Promise<NombreDeEjercicio[]> {
    return ids.filter((id) => id in this.nombres).map((id) => ({ id, nombre: this.nombres[id] }));
  }
}

export class RepositorioPlanesEnMemoria extends RepositorioPlanes {
  readonly planes: Plan[] = [];

  async guardar(plan: Plan): Promise<void> {
    const indice = this.planes.findIndex((existente) => existente.id === plan.id);
    if (indice === -1) this.planes.push(plan);
    else this.planes[indice] = plan;
  }

  /** RN-PLAN-14, 15: vigente con la fecha entre inicio y fin, ambos incluidos. */
  async listarVigentesPorAlumno(alumnoId: string, fecha: string): Promise<Plan[]> {
    return this.planes.filter(
      (plan) =>
        plan.alumnoIds.includes(alumnoId) && fecha >= plan.fechaInicio && fecha <= plan.fechaFin,
    );
  }
}

/** Vínculos alumno-profesor: solo los pares que se declaran existen (RN-PLAN-13). */
export class ConsultaVinculosFalsa extends ConsultaVinculos {
  private readonly pares: Set<string>;

  constructor(
    pares: { alumnoId: string; profesorUsuarioId: string }[] = [],
    /** Usuarios con ficha de alumno: el resto no tiene alumno asociado (US08). */
    private readonly alumnosPorUsuario: Record<string, string> = {},
  ) {
    super();
    this.pares = new Set(
      pares.map(({ alumnoId, profesorUsuarioId }) => `${alumnoId}|${profesorUsuarioId}`),
    );
  }

  async alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean> {
    return this.pares.has(`${alumnoId}|${profesorUsuarioId}`);
  }

  async obtenerAlumnoIdPorUsuarioId(usuarioId: string): Promise<string | null> {
    return this.alumnosPorUsuario[usuarioId] ?? null;
  }
}

/** Reloj fijo: los tests de vigencia no dependen de la fecha real. */
export class RelojFijo extends Reloj {
  constructor(private readonly fecha: Date) {
    super();
  }

  ahora(): Date {
    return this.fecha;
  }
}
