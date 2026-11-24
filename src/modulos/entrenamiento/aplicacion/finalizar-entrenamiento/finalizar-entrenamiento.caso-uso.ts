import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaAlumno } from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import type { DatosEntrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';

import { calcularResumen } from '../../dominio/entrenamiento/calcular-resumen.js';
import type {
  ConsultaEjerciciosResumen,
  DatosEjercicioResumen,
} from '../../dominio/entrenamiento/consulta-ejercicios-resumen.puerto.js';
export type { DatosEjercicioResumen } from '../../dominio/entrenamiento/consulta-ejercicios-resumen.puerto.js';

export class FinalizarEntrenamiento {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly ejercicios: ConsultaEjerciciosResumen,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(usuarioId: string, entrenamientoId: string) {
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');
    const entrenamiento = await this.entrenamientos.buscarPorId(entrenamientoId);
    if (!entrenamiento || entrenamiento.datos.alumnoId !== alumno.id)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');
    const ahora = this.reloj.ahora();
    if (entrenamiento.estadoEn(ahora) === 'abandonado')
      throw new ErrorDominio('RN-ENT-20', 'El entrenamiento quedó abandonado', 'conflicto');
    const catalogo = await this.preparar(entrenamiento.datos);
    return this.calcular(entrenamiento.datos, ahora, catalogo);
  }

  async preparar(datos: DatosEntrenamiento): Promise<Map<string, DatosEjercicioResumen | null>> {
    const ids = new Set([
      ...datos.rutina.bloques.map((bloque) => bloque.ejercicioId),
      ...datos.rutina.circuitos.flatMap((circuito) =>
        circuito.ejercicios.map((ejercicio) => ejercicio.ejercicioId),
      ),
    ]);
    const pares = await Promise.all(
      [...ids].map(async (id) => [id, await this.ejercicios.obtenerEjercicio(id)] as const),
    );
    return new Map(pares);
  }

  async calcular(
    datos: DatosEntrenamiento,
    ahora: Date,
    catalogo: Map<string, DatosEjercicioResumen | null>,
  ) {
    return calcularResumen(datos, ahora, catalogo);
  }
}
