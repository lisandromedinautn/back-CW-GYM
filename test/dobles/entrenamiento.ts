// Dobles de los puertos de entrenamiento para los tests unitarios (docs/TESTING.md: se mockea
// solo en los bordes). Viven fuera de src/ para no contar en la cobertura.
import type { ConsultaVinculos } from '../../src/modulos/entrenamiento/dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import { Entrenamiento } from '../../src/modulos/entrenamiento/dominio/entrenamiento/entrenamiento.entidad.js';
import { RepositorioEntrenamientos } from '../../src/modulos/entrenamiento/dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import type { SerieRealizada } from '../../src/modulos/entrenamiento/dominio/entrenamiento/serie-realizada.valor.js';

export class RepositorioEntrenamientosEnMemoria extends RepositorioEntrenamientos {
  entrenamientos: Entrenamiento[] = [];

  async insertar(entrenamiento: Entrenamiento): Promise<boolean> {
    const { alumnoId } = entrenamiento.datos;
    const repetido = this.entrenamientos.some(
      (otro) => otro.datos.alumnoId === alumnoId && otro.fecha === entrenamiento.fecha,
    );
    if (repetido) return false;
    this.entrenamientos.push(entrenamiento);
    return true;
  }

  async buscarPorId(id: string): Promise<Entrenamiento | null> {
    return this.entrenamientos.find((entrenamiento) => entrenamiento.datos.id === id) ?? null;
  }

  async buscarUltimo(alumnoId: string, hastaFecha: string): Promise<Entrenamiento | null> {
    return (
      this.delAlumno(alumnoId).find((entrenamiento) => entrenamiento.fecha <= hastaFecha) ?? null
    );
  }

  async guardarSerie(entrenamientoId: string, serie: SerieRealizada): Promise<void> {
    this.entrenamientos = this.entrenamientos.map((entrenamiento) => {
      const datos = entrenamiento.datos;
      if (datos.id !== entrenamientoId) return entrenamiento;
      const otras = datos.series.filter(
        (s) =>
          !(s.orden === serie.orden && s.numero === serie.numero && s.posicion === serie.posicion),
      );
      return Entrenamiento.reconstruir({ ...datos, series: [...otras, serie] });
    });
  }

  /** Más nuevos primero, por fecha. */
  async listarPorAlumno(
    alumnoId: string,
    pagina: number,
    tamanio: number,
  ): Promise<{ items: Entrenamiento[]; total: number }> {
    const delAlumno = this.delAlumno(alumnoId);
    const desde = (pagina - 1) * tamanio;
    return { items: delAlumno.slice(desde, desde + tamanio), total: delAlumno.length };
  }

  private delAlumno(alumnoId: string): Entrenamiento[] {
    return this.entrenamientos
      .filter((entrenamiento) => entrenamiento.datos.alumnoId === alumnoId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
}

/** Vínculos fijos: alumnoId → usuario del profesor vinculado. */
export class ConsultaVinculosFija implements ConsultaVinculos {
  constructor(private readonly vinculos: Record<string, string>) {}

  async alumnoVinculadoAProfesor(alumnoId: string, profesorUsuarioId: string): Promise<boolean> {
    return this.vinculos[alumnoId] === profesorUsuarioId;
  }
}
