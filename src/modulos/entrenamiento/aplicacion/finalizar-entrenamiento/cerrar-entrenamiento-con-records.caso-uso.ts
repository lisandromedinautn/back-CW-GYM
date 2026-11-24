import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type {
  ConsultaEjerciciosRecords,
  DatosEjercicioRecords,
} from '../../dominio/entrenamiento/consulta-ejercicios-records.puerto.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import type { EjercicioParaRecords } from '../../dominio/marcas-por-tipo-ejercicio/ejercicio-para-records.js';
import type { MarcasPorTipoEjercicio } from '../../dominio/marcas-por-tipo-ejercicio/marcas-por-tipo-ejercicio.js';
import type { DetectorRecords } from '../../dominio/record-personal/detector-records.js';
import type { MarcaRecord } from '../../dominio/record-personal/marca-record.js';
import type { RepositorioRecords } from '../../dominio/record-personal/repositorio-records.puerto.js';
import type { CerrarEntrenamiento } from './cerrar-entrenamiento.caso-uso.js';
import type {
  RecordBatidoResumen,
  ResumenEntrenamientoConRecords,
} from './resumen-entrenamiento-con-records.js';

interface EjercicioConNombre {
  ejercicio: EjercicioParaRecords;
  nombre: string;
}

/** Cierra el entrenamiento y, con las series ya persistidas, detecta y guarda los récords. */
export class CerrarEntrenamientoConRecords {
  constructor(
    private readonly cerrar: CerrarEntrenamiento,
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly records: RepositorioRecords,
    private readonly catalogo: ConsultaEjerciciosRecords,
    private readonly marcas: MarcasPorTipoEjercicio,
    private readonly detector: DetectorRecords,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(usuarioId: string, id: string): Promise<ResumenEntrenamientoConRecords> {
    const resumen = await this.cerrar.ejecutar(usuarioId, id);
    const entrenamiento = await this.entrenamientos.buscarPorId(id);
    if (!entrenamiento)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Entrenamiento no encontrado', 'no-encontrado');
    const datos = entrenamiento.datos;
    if (datos.series.length === 0) return resumen;

    const ejercicios = await this.cargarEjercicios(datos.series.map((serie) => serie.ejercicioId));
    const marcas = this.agruparMejores(
      datos.series.flatMap((serie) => {
        const encontrado = ejercicios.get(serie.ejercicioId);
        if (!encontrado) return [];
        return this.marcas.marcasDe({
          serie,
          ejercicio: encontrado.ejercicio,
          pesoCorporalKg: datos.pesoCorporalKg,
        });
      }),
    );
    const ejercicioIds = [...new Set(datos.series.map((serie) => serie.ejercicioId))];
    const previos = await this.records.buscarPorAlumnoYEjercicios(datos.alumnoId, ejercicioIds);
    const { guardados, batidos } = this.detector.detectar(marcas, previos, {
      alumnoId: datos.alumnoId,
      entrenamientoId: datos.id,
      fecha: datos.inicio.slice(0, 10),
    });
    await this.records.guardar(guardados);
    for (const evento of batidos) await this.publicador.publicar(evento);

    if (batidos.length === 0) return resumen;
    return {
      ...resumen,
      recordsBatidos: batidos.map((evento) => this.aResumen(evento, ejercicios)),
    };
  }

  private async cargarEjercicios(ids: string[]): Promise<Map<string, EjercicioConNombre>> {
    const unicos = [...new Set(ids)];
    const pares = await Promise.all(
      unicos.map(async (id) => {
        const datos = await this.catalogo.obtenerDatosParaRecords(id);
        if (!datos)
          throw new ErrorDominio(
            'RN-ENT-09',
            'No se encontró un ejercicio del entrenamiento',
            'no-encontrado',
          );
        return [id, aEjercicioConNombre(datos)] as const;
      }),
    );
    return new Map(pares);
  }

  /** Una sola marca por ejercicio y tipo: la mejor del entrenamiento. */
  private agruparMejores(marcas: MarcaRecord[]): MarcaRecord[] {
    const mejores = new Map<string, MarcaRecord>();
    for (const marca of marcas) {
      const clave = `${marca.ejercicioId}|${marca.tipo}`;
      const actual = mejores.get(clave);
      if (!actual || marca.valor > actual.valor) mejores.set(clave, marca);
    }
    return [...mejores.values()];
  }

  private aResumen(
    evento: {
      ejercicioId: string;
      tipo: RecordBatidoResumen['tipo'];
      valorAnterior: number;
      valorNuevo: number;
    },
    ejercicios: ReadonlyMap<string, EjercicioConNombre>,
  ): RecordBatidoResumen {
    return {
      ejercicioId: evento.ejercicioId,
      nombre: ejercicios.get(evento.ejercicioId)!.nombre,
      tipo: evento.tipo,
      valorAnterior: evento.valorAnterior,
      valorNuevo: evento.valorNuevo,
    };
  }
}

function aEjercicioConNombre(datos: DatosEjercicioRecords): EjercicioConNombre {
  if (
    (datos.tipoCarga === 'Peso Corporal' || datos.tipoCarga === 'Peso Corporal + Peso Extra') &&
    datos.factorPesoCorporal === null
  )
    throw new ErrorDominio(
      'RN-ENT-07',
      'Falta el factor de peso corporal del ejercicio',
      'validacion',
    );
  return {
    ejercicio: {
      id: datos.id,
      tipo: datos.tipo,
      tipoCarga: datos.tipoCarga,
      factorPesoCorporal: datos.factorPesoCorporal ?? 0,
    },
    nombre: datos.nombre,
  };
}
