import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

/** Medida de una serie: repeticiones o segundos, y peso si corresponde. */
@ApiSchema({
  name: 'Respuesta.MedidaSerie',
  description: 'Medida de una serie: repeticiones, segundos y peso.',
})
export class MedidaSerieRespuesta {
  @ApiProperty({
    description: 'Repeticiones de la serie. `null` si la serie se mide por tiempo.',
    example: 10,
    nullable: true,
  })
  repeticiones: number | null;

  @ApiProperty({
    description: 'Duración de la serie en segundos. `null` si la serie se mide por repeticiones.',
    example: null,
    nullable: true,
  })
  segundos: number | null;

  @ApiProperty({
    description: 'Peso en kilogramos de la serie. `null` si el ejercicio no usa peso.',
    example: 20,
    nullable: true,
  })
  pesoKg: number | null;
}

/** Ejercicio prescripto dentro de la copia de la rutina (RN-ENT-02). */
@ApiSchema({
  name: 'Respuesta.EjercicioPrescripto',
  description: 'Ejercicio prescripto dentro de la copia de la rutina.',
})
export class EjercicioPrescriptoRespuesta {
  @ApiProperty({
    description: 'Identificador del ejercicio en el catálogo.',
    example: '3f7c2b1e-8d4a-4e6b-9a1f-2c5d7e8f9a0b',
    format: 'uuid',
  })
  ejercicioId: string;

  @ApiProperty({
    description: 'Nombre del ejercicio tomado del catálogo al iniciar el entrenamiento.',
    example: 'Press de banca',
  })
  nombre: string;

  @ApiProperty({
    description: 'Repeticiones prescriptas. `null` si el ejercicio se prescribe por tiempo.',
    example: 10,
    nullable: true,
  })
  repeticiones: number | null;

  @ApiProperty({
    description: 'Segundos prescriptos. `null` si el ejercicio se prescribe por repeticiones.',
    example: null,
    nullable: true,
  })
  segundos: number | null;

  @ApiProperty({
    description: 'Peso prescripto en kilogramos. `null` si el ejercicio no usa peso.',
    example: 60,
    nullable: true,
  })
  pesoKg: number | null;

  @ApiPropertyOptional({
    description:
      'RN-ENT-02 (T14): URL del GIF del ejercicio en el catálogo, copiada al iniciar. `null` si el catálogo no lo tiene. Los entrenamientos iniciados antes de T14 no lo traen.',
    example: 'https://cdn.ejemplo.com/gifs/press-de-banca.gif',
    nullable: true,
  })
  urlGif?: string | null;
}

/** Bloque de la copia de la rutina: un ejercicio con sus series y pausas. */
@ApiSchema({
  name: 'Respuesta.BloqueRutina',
  description: 'Bloque de la copia de la rutina con sus series y pausas.',
})
export class BloqueRutinaRespuesta extends EjercicioPrescriptoRespuesta {
  @ApiProperty({
    description:
      'Posición del bloque dentro de la rutina. Es el `orden` que se envía al registrar series.',
    example: 1,
  })
  orden: number;

  @ApiProperty({
    description: 'Cantidad de series prescriptas del bloque.',
    example: 4,
  })
  series: number;

  @ApiProperty({
    description: 'Pausa en segundos entre series del mismo ejercicio.',
    example: 90,
  })
  micropausaSegundos: number;

  @ApiProperty({
    description: 'Pausa en segundos al terminar el bloque.',
    example: 120,
  })
  macropausaSegundos: number;
}

/** Circuito de la copia de la rutina: varios ejercicios que se repiten por vueltas. */
@ApiSchema({
  name: 'Respuesta.CircuitoRutina',
  description: 'Circuito de la copia de la rutina con sus vueltas y ejercicios.',
})
export class CircuitoRutinaRespuesta {
  @ApiProperty({
    description:
      'Posición del circuito dentro de la rutina. Es el `orden` que se envía al registrar series.',
    example: 2,
  })
  orden: number;

  @ApiProperty({
    description: 'Cantidad de vueltas prescriptas del circuito.',
    example: 3,
  })
  vueltas: number;

  @ApiProperty({
    description: 'Pausa en segundos al terminar cada vuelta del circuito.',
    example: 60,
  })
  macropausaSegundos: number;

  @ApiProperty({
    description: 'Ejercicios del circuito, en el orden en que se hacen.',
    type: () => [EjercicioPrescriptoRespuesta],
  })
  ejercicios: EjercicioPrescriptoRespuesta[];
}

/** Copia independiente de la rutina del día, guardada al iniciar (RN-ENT-02). */
@ApiSchema({
  name: 'Respuesta.RutinaCopiada',
  description: 'Copia independiente de la rutina guardada al iniciar el entrenamiento.',
})
export class RutinaCopiadaRespuesta {
  @ApiProperty({
    description: 'Identificador de la rutina de origen.',
    example: '9b1d4e2a-6f3c-4a8e-b7d2-1e5f0a9c8b7d',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la rutina al momento de iniciar el entrenamiento.',
    example: 'Full body A',
  })
  nombre: string;

  @ApiProperty({
    description: 'Tipo de la rutina según la planificación.',
    example: 'Fuerza',
  })
  tipo: string;

  @ApiProperty({
    description: 'Bloques de ejercicios de la rutina.',
    type: () => [BloqueRutinaRespuesta],
  })
  bloques: BloqueRutinaRespuesta[];

  @ApiProperty({
    description: 'Circuitos de la rutina.',
    type: () => [CircuitoRutinaRespuesta],
  })
  circuitos: CircuitoRutinaRespuesta[];
}

/** Serie Realizada (RN-ENT-03): lo hecho junto a lo prescripto en la copia. */
@ApiSchema({
  name: 'Entidad.SerieRealizada',
  description: 'Serie realizada: lo hecho junto a lo prescripto en la copia.',
})
export class SerieRegistradaRespuesta {
  @ApiProperty({
    description: 'Orden del bloque o circuito de la copia al que pertenece la serie.',
    example: 1,
  })
  orden: number;

  @ApiProperty({
    description: 'Número de serie del bloque (1..series) o de vuelta del circuito (1..vueltas).',
    example: 2,
  })
  numero: number;

  @ApiProperty({
    description: 'Posición del ejercicio dentro del circuito, desde 1. `null` en bloques.',
    example: null,
    nullable: true,
  })
  posicion: number | null;

  @ApiProperty({
    description: 'Identificador del ejercicio de la serie.',
    example: '3f7c2b1e-8d4a-4e6b-9a1f-2c5d7e8f9a0b',
    format: 'uuid',
  })
  ejercicioId: string;

  @ApiProperty({
    description: 'Nombre del ejercicio de la serie.',
    example: 'Press de banca',
  })
  nombre: string;

  @ApiProperty({
    description: 'Medida prescripta en la copia de la rutina para esta serie.',
    type: () => MedidaSerieRespuesta,
  })
  prescripta: MedidaSerieRespuesta;

  @ApiProperty({
    description:
      'Medida que el alumno registró. Solo se conserva la medida que corresponde a lo prescripto (RN-ENT-03).',
    type: () => MedidaSerieRespuesta,
  })
  realizada: MedidaSerieRespuesta;
}

/** Percepción del alumno sobre el entrenamiento (RN-ENT-14, RN-ENT-15, RN-ENT-16). */
@ApiSchema({
  name: 'Respuesta.PercepcionRegistrada',
  description: 'Percepción del alumno: RPE y sensación de fuerza.',
})
export class PercepcionRegistradaRespuesta {
  @ApiProperty({
    description: 'RPE (esfuerzo percibido), entero de 1 a 10 (RN-ENT-14).',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  rpe: number;

  @ApiProperty({
    description: 'Sensación de fuerza, entero de 1 a 5 (RN-ENT-15).',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  sensacionFuerza: number;
}

/** Resumen calculado al finalizar el entrenamiento (RN-ENT-05, RN-ENT-06, RN-ENT-09, RN-ENT-17). */
@ApiSchema({
  name: 'Respuesta.ResumenEntrenamiento',
  description: 'Resumen calculado al finalizar el entrenamiento.',
})
export class ResumenEntrenamientoRespuesta {
  @ApiProperty({
    description:
      'Volumen total del entrenamiento en kilogramos: suma de la carga efectiva por repeticiones de todas las series (RN-ENT-06).',
    example: 5420,
  })
  volumenKg: number;

  @ApiProperty({
    description: 'Duración del entrenamiento en segundos: fin − inicio (RN-ENT-05).',
    example: 3600,
  })
  duracionSegundos: number;

  @ApiProperty({
    description:
      'Grupos musculares trabajados, sin repetir, con el músculo principal y el secundario de cada ejercicio con al menos una serie realizada (RN-ENT-09).',
    example: ['Pecho', 'Tríceps', 'Hombros'],
    type: [String],
  })
  gruposMusculares: string[];
}

/** Récord personal batido al finalizar el entrenamiento (RN-ENT-13). */
@ApiSchema({
  name: 'Respuesta.RecordBatido',
  description: 'Récord personal batido al finalizar el entrenamiento.',
})
export class RecordBatidoRespuesta {
  @ApiProperty({
    description: 'Identificador del ejercicio con el récord.',
    example: '3f7c2b1e-8d4a-4e6b-9a1f-2c5d7e8f9a0b',
    format: 'uuid',
  })
  ejercicioId: string;

  @ApiProperty({
    description: 'Nombre del ejercicio con el récord.',
    example: 'Press de banca',
  })
  nombre: string;

  @ApiProperty({
    description:
      'Tipo de récord (RN-ENT-10): repeticiones, volumen de serie, 1RM estimado o tiempo.',
    enum: ['repeticiones', 'volumen', '1rm', 'tiempo'],
    example: '1rm',
  })
  tipo: 'repeticiones' | 'volumen' | '1rm' | 'tiempo';

  @ApiProperty({
    description:
      'Marca del récord anterior. Solo se anuncia cuando la marca nueva es estrictamente mayor (RN-ENT-13).',
    example: 100,
  })
  valorAnterior: number;

  @ApiProperty({
    description: 'Marca nueva que bate el récord anterior.',
    example: 108,
  })
  valorNuevo: number;
}

/** Respuesta de POST entrenamientos/:id/finalizacion: resumen y récords batidos, si los hubo. */
@ApiSchema({
  name: 'Respuesta.ResumenFinalizacion',
  description: 'Respuesta de la finalización: resumen y récords batidos.',
})
export class ResumenFinalizacionRespuesta extends ResumenEntrenamientoRespuesta {
  @ApiPropertyOptional({
    description:
      'Récords batidos en el entrenamiento (RN-ENT-13). Solo aparece si hubo al menos uno. La primera marca de un ejercicio no se anuncia.',
    type: () => [RecordBatidoRespuesta],
  })
  recordsBatidos?: RecordBatidoRespuesta[];
}

/** Entrenamiento iniciado: copia de la rutina, peso corporal y hora de inicio (RN-ENT-02, RN-ENT-08). */
@ApiSchema({
  name: 'Respuesta.IniciarEntrenamiento',
  description: 'Entrenamiento recién iniciado con su copia de la rutina.',
})
export class IniciarEntrenamientoRespuesta {
  @ApiProperty({
    description: 'Identificador del entrenamiento.',
    example: '5e8a1c3d-2b7f-4d9e-8a6c-0f1b2d3e4a5b',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del alumno dueño del entrenamiento.',
    example: '7a2f9c1e-4b3d-4e8a-9f6c-1d2e3f4a5b6c',
    format: 'uuid',
  })
  alumnoId: string;

  @ApiProperty({
    description: 'Instante de inicio en ISO 8601 (UTC).',
    example: '2026-11-25T14:05:00.000Z',
    format: 'date-time',
  })
  inicio: string;

  @ApiProperty({
    description:
      'Peso corporal del alumno guardado al iniciar. Se usa en todos los cálculos aunque cambie después (RN-ENT-08).',
    example: 80,
  })
  pesoCorporalKg: number;

  @ApiProperty({
    description: 'Copia independiente de la rutina del día (RN-ENT-02).',
    type: () => RutinaCopiadaRespuesta,
  })
  rutina: RutinaCopiadaRespuesta;

  @ApiProperty({
    description: 'Series registradas. Al iniciar siempre es una lista vacía.',
    type: () => [SerieRegistradaRespuesta],
    example: [],
  })
  series: SerieRegistradaRespuesta[];
}

/** Entrenamiento completo con su estado, series, cierre y percepción. */
@ApiSchema({
  name: 'Entidad.Entrenamiento',
  description: 'Entrenamiento completo con su estado, series, cierre y percepción.',
})
export class EntrenamientoDetalleRespuesta extends IniciarEntrenamientoRespuesta {
  @ApiPropertyOptional({
    description:
      'Instante de finalización en ISO 8601 (UTC). Solo existe si el entrenamiento fue finalizado (RN-ENT-05).',
    example: '2026-11-25T15:10:00.000Z',
    format: 'date-time',
  })
  fin?: string;

  @ApiPropertyOptional({
    description: 'Resumen calculado al finalizar. Solo existe si el entrenamiento fue finalizado.',
    type: () => ResumenEntrenamientoRespuesta,
  })
  resumen?: ResumenEntrenamientoRespuesta;

  @ApiPropertyOptional({
    description:
      'Percepción del alumno. Solo aparece en entrenamientos finalizados; `null` si todavía no se cargó (RN-ENT-16).',
    type: () => PercepcionRegistradaRespuesta,
    nullable: true,
  })
  percepcion?: PercepcionRegistradaRespuesta | null;
}

/** Respuesta de GET mi-entrenamiento-en-curso: el último entrenamiento del alumno o su ausencia. */
@ApiSchema({
  name: 'Respuesta.EntrenamientoEnCurso',
  description: 'Último entrenamiento del alumno o su ausencia.',
})
export class EntrenamientoEnCursoRespuesta {
  @ApiProperty({
    description:
      'Estado del último entrenamiento. `sin-entrenamiento` si no hay ninguno hoy o en el pasado reciente. `abandonado` si pasó la medianoche sin finalizar (RN-ENT-20).',
    enum: ['sin-entrenamiento', 'en-curso', 'abandonado', 'finalizado'],
    example: 'en-curso',
  })
  estado: 'sin-entrenamiento' | 'en-curso' | 'abandonado' | 'finalizado';

  @ApiPropertyOptional({
    description: 'Entrenamiento consultado. Ausente cuando `estado` es `sin-entrenamiento`.',
    type: () => EntrenamientoDetalleRespuesta,
  })
  entrenamiento?: EntrenamientoDetalleRespuesta;
}

/** Entrenamiento de la lista del profesor, con su estado y percepción siempre presentes (US18). */
@ApiSchema({
  name: 'Respuesta.EntrenamientoDeAlumno',
  description: 'Entrenamiento de la lista del profesor, con estado y percepción.',
})
export class EntrenamientoDeAlumnoRespuesta {
  @ApiProperty({
    description: 'Identificador del entrenamiento.',
    example: '5e8a1c3d-2b7f-4d9e-8a6c-0f1b2d3e4a5b',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del alumno dueño del entrenamiento.',
    example: '7a2f9c1e-4b3d-4e8a-9f6c-1d2e3f4a5b6c',
    format: 'uuid',
  })
  alumnoId: string;

  @ApiProperty({
    description: 'Instante de inicio en ISO 8601 (UTC).',
    example: '2026-11-24T14:05:00.000Z',
    format: 'date-time',
  })
  inicio: string;

  @ApiProperty({
    description: 'Peso corporal del alumno guardado al iniciar (RN-ENT-08).',
    example: 80,
  })
  pesoCorporalKg: number;

  @ApiProperty({
    description: 'Copia independiente de la rutina del día (RN-ENT-02).',
    type: () => RutinaCopiadaRespuesta,
  })
  rutina: RutinaCopiadaRespuesta;

  @ApiProperty({
    description: 'Series registradas en el entrenamiento.',
    type: () => [SerieRegistradaRespuesta],
  })
  series: SerieRegistradaRespuesta[];

  @ApiPropertyOptional({
    description:
      'Instante de finalización en ISO 8601 (UTC). Solo existe si el entrenamiento fue finalizado.',
    example: '2026-11-24T15:10:00.000Z',
    format: 'date-time',
  })
  fin?: string;

  @ApiPropertyOptional({
    description: 'Resumen calculado al finalizar. Solo existe si el entrenamiento fue finalizado.',
    type: () => ResumenEntrenamientoRespuesta,
  })
  resumen?: ResumenEntrenamientoRespuesta;

  @ApiProperty({
    description:
      'Percepción del alumno; `null` si no se cargó o si el entrenamiento no está finalizado (RN-ENT-16).',
    type: () => PercepcionRegistradaRespuesta,
    nullable: true,
  })
  percepcion: PercepcionRegistradaRespuesta | null;

  @ApiProperty({
    description: 'Estado del entrenamiento calculado con el reloj del servidor (RN-ENT-20).',
    enum: ['en-curso', 'abandonado', 'finalizado'],
    example: 'finalizado',
  })
  estado: 'en-curso' | 'abandonado' | 'finalizado';
}

/** Página de entrenamientos de un alumno, del más nuevo al más viejo (US18, RN-ENT-18). */
@ApiSchema({
  name: 'Respuesta.PaginaEntrenamientosDeAlumno',
  description: 'Página de entrenamientos de un alumno, del más nuevo al más viejo.',
})
export class PaginaEntrenamientosDeAlumnoRespuesta {
  @ApiProperty({
    description: 'Entrenamientos de la página solicitada.',
    type: () => [EntrenamientoDeAlumnoRespuesta],
  })
  items: EntrenamientoDeAlumnoRespuesta[];

  @ApiProperty({
    description: 'Cantidad total de entrenamientos del alumno, en todas las páginas.',
    example: 23,
  })
  total: number;

  @ApiProperty({
    description: 'Número de página devuelta; arranca en 1.',
    example: 1,
  })
  pagina: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página.',
    example: 10,
    enum: [5, 10, 20, 50, 100],
  })
  tamanio: number;
}
