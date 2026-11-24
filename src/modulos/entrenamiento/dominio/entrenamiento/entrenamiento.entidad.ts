import type { ResumenEntrenamiento } from './resumen-entrenamiento.js';
import { EntrenamientoFinalizado } from './entrenamiento-finalizado.evento.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { CopiaRutina, EjercicioPrescriptoCopiado } from './copia-rutina.valor.js';
import { EntrenamientoIniciado } from './entrenamiento-iniciado.evento.js';
import { EventoSerieRealizada } from './serie-realizada.evento.js';
import type { MedidaSerie, RegistroSerie, SerieRealizada } from './serie-realizada.valor.js';
import { seriesPorDebajo } from './series-por-debajo.js';

export interface DatosEntrenamiento {
  id: string;
  alumnoId: string;
  inicio: string;
  pesoCorporalKg: number;
  rutina: CopiaRutina;
  series: SerieRealizada[];
  fin?: string;
  resumen?: ResumenEntrenamiento;
}

export type DatosInicio = Omit<DatosEntrenamiento, 'series'>;

export class Entrenamiento {
  private constructor(private readonly registro: DatosEntrenamiento) {}

  static crear(datos: DatosInicio): Entrenamiento {
    return new Entrenamiento({ ...structuredClone(datos), series: [] });
  }

  static reconstruir(datos: DatosEntrenamiento): Entrenamiento {
    return new Entrenamiento(datos);
  }

  get datos(): DatosEntrenamiento {
    return structuredClone(this.registro);
  }

  get fecha(): string {
    return this.registro.inicio.slice(0, 10);
  }

  estadoEn(instante: Date): 'en-curso' | 'abandonado' | 'finalizado' {
    if (this.registro.fin) return 'finalizado';
    return instante.toISOString().slice(0, 10) > this.fecha ? 'abandonado' : 'en-curso';
  }

  eventoDeInicio(): EntrenamientoIniciado {
    return new EntrenamientoIniciado(
      this.registro.id,
      this.registro.alumnoId,
      this.registro.inicio,
    );
  }

  asegurarFinalizable(instante: Date): void {
    if (this.registro.fin)
      throw new ErrorDominio('RN-ENT-05', 'El entrenamiento ya fue finalizado', 'conflicto');
    if (this.estadoEn(instante) === 'abandonado')
      throw new ErrorDominio('RN-ENT-20', 'El entrenamiento quedó abandonado', 'conflicto');
    if (instante.getTime() < Date.parse(this.registro.inicio))
      throw new ErrorDominio(
        'RN-ENT-05',
        'La hora de fin no puede ser anterior al inicio',
        'validacion',
      );
  }

  finalizar(instante: Date, resumen: ResumenEntrenamiento): EntrenamientoFinalizado {
    this.asegurarFinalizable(instante);
    this.registro.fin = instante.toISOString();
    this.registro.resumen = structuredClone(resumen);
    return this.eventoDeFin();
  }

  /** Evento de un entrenamiento ya finalizado, con las series por debajo de lo prescripto (RN-ENT-21). */
  eventoDeFin(): EntrenamientoFinalizado {
    const { id, alumnoId, inicio, fin, rutina, series } = this.registro;
    if (!fin)
      throw new ErrorDominio('RN-ENT-05', 'El entrenamiento no fue finalizado', 'conflicto');
    const { totalSeries, porDebajo } = seriesPorDebajo(rutina, series);
    return new EntrenamientoFinalizado(
      id,
      alumnoId,
      fin,
      inicio,
      rutina.nombre,
      totalSeries,
      porDebajo,
    );
  }

  /**
   * Registra lo hecho en una serie prescripta de la copia (RN-ENT-03). Registrar de nuevo la
   * misma serie la reemplaza (corrección). Un entrenamiento abandonado no admite series (RN-ENT-20).
   */
  registrarSerie(registro: RegistroSerie, instante: Date): EventoSerieRealizada {
    if (this.estadoEn(instante) === 'finalizado')
      throw new ErrorDominio('RN-ENT-04', 'El entrenamiento ya fue finalizado', 'conflicto');
    if (this.estadoEn(instante) === 'abandonado') {
      throw new ErrorDominio(
        'RN-ENT-20',
        'El entrenamiento quedó abandonado: no admite series',
        'conflicto',
      );
    }
    const posicion = registro.posicion ?? null;
    const prescripto = this.ejercicioPrescripto(registro.orden, registro.numero, posicion);
    const realizada = medidaRealizada(prescripto, registro);
    const serie: SerieRealizada = {
      orden: registro.orden,
      numero: registro.numero,
      posicion,
      ejercicioId: prescripto.ejercicioId,
      nombre: prescripto.nombre,
      prescripta: {
        repeticiones: prescripto.repeticiones,
        segundos: prescripto.segundos,
        pesoKg: prescripto.pesoKg,
      },
      realizada,
    };
    const otras = this.registro.series.filter(
      (s) => !(s.orden === serie.orden && s.numero === serie.numero && s.posicion === posicion),
    );
    this.registro.series = [...otras, serie];
    return new EventoSerieRealizada(
      this.registro.id,
      this.registro.alumnoId,
      structuredClone(serie),
    );
  }

  private ejercicioPrescripto(
    orden: number,
    numero: number,
    posicion: number | null,
  ): EjercicioPrescriptoCopiado {
    const bloque = this.registro.rutina.bloques.find((b) => b.orden === orden);
    if (bloque && posicion === null && enRango(numero, bloque.series)) return bloque;
    const circuito = this.registro.rutina.circuitos.find((c) => c.orden === orden);
    if (
      circuito &&
      posicion !== null &&
      enRango(numero, circuito.vueltas) &&
      enRango(posicion, circuito.ejercicios.length)
    ) {
      return circuito.ejercicios[posicion - 1];
    }
    throw errorDeSerie('La serie no existe en la rutina del entrenamiento');
  }
}

const enRango = (valor: number, maximo: number): boolean =>
  Number.isInteger(valor) && valor >= 1 && valor <= maximo;

const esCantidad = (valor: number | null | undefined): valor is number =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= 0;

const errorDeSerie = (mensaje: string) => new ErrorDominio('RN-ENT-03', mensaje, 'validacion');

/** Lo realizado se mide igual que lo prescripto: repeticiones o segundos, y peso opcional ≥ 0. */
function medidaRealizada(
  prescripto: EjercicioPrescriptoCopiado,
  registro: RegistroSerie,
): MedidaSerie {
  const porRepeticiones = prescripto.repeticiones !== null;
  const medida = porRepeticiones ? registro.repeticiones : registro.segundos;
  if (!esCantidad(medida)) {
    throw errorDeSerie(
      porRepeticiones
        ? 'Indicá las repeticiones realizadas (entero ≥ 0)'
        : 'Indicá los segundos realizados (entero ≥ 0)',
    );
  }
  const pesoKg = registro.pesoKg ?? null;
  if (pesoKg !== null && !(Number.isFinite(pesoKg) && pesoKg >= 0)) {
    throw errorDeSerie('El peso debe ser un número ≥ 0');
  }
  return {
    repeticiones: porRepeticiones ? medida : null,
    segundos: porRepeticiones ? null : medida,
    pesoKg,
  };
}
