import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

/** Medida de una serie: repeticiones o segundos, y peso opcional (RN-NOT-01). */
@ApiSchema({
  name: 'Respuesta.MedidaSerie',
  description: 'Medida de una serie: repeticiones o segundos, y peso opcional.',
})
export class MedidaSerieRespuesta {
  @ApiProperty({
    description: 'Repeticiones de la serie. Null si la medida es por tiempo.',
    nullable: true,
    example: 10,
  })
  repeticiones!: number | null;

  @ApiProperty({
    description: 'Segundos de la serie. Null si la medida es por repeticiones.',
    nullable: true,
    example: null,
  })
  segundos!: number | null;

  @ApiProperty({
    description: 'Peso en kilogramos usado en la serie. Null si no aplica.',
    nullable: true,
    example: 40,
  })
  pesoKg!: number | null;
}

/** Serie por debajo de lo prescripto (RN-NOT-01): lo prescripto y lo realizado. */
@ApiSchema({
  name: 'Respuesta.SeriePorDebajo',
  description: 'Serie por debajo de lo prescripto, con lo prescripto y lo realizado.',
})
export class SeriePorDebajoRespuesta {
  @ApiProperty({ description: 'Orden de la serie dentro del Entrenamiento.', example: 3 })
  orden!: number;

  @ApiProperty({ description: 'Número de la serie dentro de su ejercicio.', example: 2 })
  numero!: number;

  @ApiProperty({
    description: 'Posición del ejercicio en la rutina. Null si no tiene posición.',
    nullable: true,
    example: 1,
  })
  posicion!: number | null;

  @ApiProperty({
    description: 'Id del ejercicio de la serie.',
    format: 'uuid',
    example: '3f2b8c1e-6a4d-4e0b-9c2a-1d7e5f8a9b01',
  })
  ejercicioId!: string;

  @ApiProperty({ description: 'Nombre del ejercicio.', example: 'Sentadilla trasera' })
  nombre!: string;

  @ApiProperty({
    description: 'Medida prescripta por el profesor para la serie.',
    type: () => MedidaSerieRespuesta,
  })
  prescripta!: MedidaSerieRespuesta;

  @ApiProperty({
    description: 'Medida realizada por el alumno. Null si no se registró la serie.',
    type: () => MedidaSerieRespuesta,
    nullable: true,
  })
  realizada!: MedidaSerieRespuesta | null;
}

/** Alumno de la notificación (nombre y apellido, RN-NOT-01). */
@ApiSchema({
  name: 'Respuesta.AlumnoNotificacion',
  description: 'Alumno al que refiere una notificación, con nombre y apellido.',
})
export class AlumnoNotificacionRespuesta {
  @ApiProperty({
    description: 'Id del alumno.',
    format: 'uuid',
    example: '5a1d9e7b-2c3f-4b8a-8e6d-7f0c1b2a3d45',
  })
  id!: string;

  @ApiProperty({ description: 'Nombre del alumno.', example: 'Juan' })
  nombre!: string;

  @ApiProperty({ description: 'Apellido del alumno.', example: 'Pérez Martín' })
  apellido!: string;
}

/** Entrenamiento al que refiere la notificación (RN-NOT-01). */
@ApiSchema({
  name: 'Respuesta.EntrenamientoNotificacion',
  description: 'Entrenamiento al que refiere una notificación: id, rutina e inicio.',
})
export class EntrenamientoNotificacionRespuesta {
  @ApiProperty({
    description: 'Id del Entrenamiento.',
    format: 'uuid',
    example: '9c4e2a1f-7b3d-4e5a-8f6b-2d1c0e9a8b76',
  })
  id!: string;

  @ApiProperty({ description: 'Nombre de la rutina realizada.', example: 'Fuerza tren inferior A' })
  rutina!: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio del Entrenamiento, en ISO 8601 (UTC).',
    format: 'date-time',
    example: '2026-11-24T18:30:00.000Z',
  })
  inicio!: string;
}

/** Entrenamiento de la racha de una alerta de incumplimiento (RN-NOT-08). */
@ApiSchema({
  name: 'Respuesta.EntrenamientoAlerta',
  description: 'Entrenamiento de la racha de una alerta de incumplimiento.',
})
export class EntrenamientoAlertaRespuesta {
  @ApiProperty({
    description: 'Id del Entrenamiento.',
    format: 'uuid',
    example: '9c4e2a1f-7b3d-4e5a-8f6b-2d1c0e9a8b76',
  })
  id!: string;

  @ApiProperty({
    description: 'Fecha de finalización del Entrenamiento, en ISO 8601 (UTC).',
    format: 'date-time',
    example: '2026-11-22T19:05:00.000Z',
  })
  fecha!: string;

  @ApiProperty({
    description: 'Nombre de la rutina del Entrenamiento.',
    example: 'Fuerza tren inferior A',
  })
  rutina!: string;
}

/** Percepción del alumno sobre el Entrenamiento (RN-NOT-06). */
@ApiSchema({
  name: 'Respuesta.PercepcionNotificacion',
  description: 'Percepción del alumno sobre el Entrenamiento: RPE y sensación de fuerza.',
})
export class PercepcionNotificacionRespuesta {
  @ApiProperty({
    description:
      'RPE declarado por el alumno. Es malo si vale 9 o más (RN-NOT-06). Null si no se informó.',
    nullable: true,
    example: 9,
  })
  rpe!: number | null;

  @ApiProperty({
    description:
      'Sensación de fuerza declarada por el alumno. Es mala si vale 2 o menos (RN-NOT-06). Null si no se informó.',
    nullable: true,
    example: 3,
  })
  sensacionFuerza!: number | null;
}

/**
 * Un ítem de la bandeja de notificaciones del profesor (RN-NOT-03).
 * Solo las alertas de incumplimiento (RN-NOT-08) traen `entrenamientos`.
 */
@ApiSchema({
  name: 'Entidad.Notificacion',
  description:
    'Forma pública de una notificación de la bandeja del profesor: tipo, gravedad, alumno, entrenamiento y estado de lectura.',
})
export class NotificacionRespuesta {
  @ApiProperty({
    description: 'Id de la notificación.',
    format: 'uuid',
    example: '7e8f9a0b-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  })
  id!: string;

  @ApiProperty({
    description:
      'Tipo de notificación: "entrenamiento" por un Entrenamiento por debajo o con percepción mala (RN-NOT-01, 06), o "alerta-incumplimiento" por tres Entrenamientos seguidos por debajo (RN-NOT-08).',
    enum: ['entrenamiento', 'alerta-incumplimiento'],
    example: 'entrenamiento',
  })
  tipo!: 'entrenamiento' | 'alerta-incumplimiento';

  @ApiProperty({
    description: 'Fecha y hora de creación de la notificación, en ISO 8601 (UTC).',
    format: 'date-time',
    example: '2026-11-24T19:10:00.000Z',
  })
  creada!: string;

  @ApiProperty({
    description:
      'Indica si el profesor ya la marcó como leída. Vuelve a false si el alumno suma una percepción (RN-NOT-05).',
    example: false,
  })
  leida!: boolean;

  @ApiProperty({
    description:
      'Gravedad. Con series por debajo: Grave si son el 40% o más del total, Leve si es menor (RN-NOT-02). Con percepción mala: Leve si cumple una condición, Grave si cumple las dos. Si hay ambas, la mayor (RN-NOT-07). Las alertas de incumplimiento son siempre Grave (RN-NOT-08).',
    enum: ['leve', 'grave'],
    example: 'grave',
  })
  gravedad!: 'leve' | 'grave';

  @ApiProperty({
    description: 'Alumno al que refiere la notificación.',
    type: () => AlumnoNotificacionRespuesta,
  })
  alumno!: AlumnoNotificacionRespuesta;

  @ApiProperty({
    description: 'Entrenamiento al que refiere la notificación.',
    type: () => EntrenamientoNotificacionRespuesta,
  })
  entrenamiento!: EntrenamientoNotificacionRespuesta;

  @ApiProperty({
    description: 'Cantidad de series prescriptas del Entrenamiento. En las alertas, 0.',
    example: 10,
  })
  totalSeries!: number;

  @ApiProperty({
    description:
      'Series por debajo de lo prescripto, con lo prescripto y lo realizado (RN-NOT-01). Vacío si la notificación es solo por percepción o es una alerta.',
    type: () => [SeriePorDebajoRespuesta],
  })
  seriesPorDebajo!: SeriePorDebajoRespuesta[];

  @ApiProperty({
    description: 'Percepción del alumno. Null hasta que la carga (RN-NOT-05).',
    type: () => PercepcionNotificacionRespuesta,
    nullable: true,
  })
  percepcion!: PercepcionNotificacionRespuesta | null;

  @ApiPropertyOptional({
    description:
      'Solo en las alertas de incumplimiento: los 3 Entrenamientos de la racha, del más viejo al más nuevo (RN-NOT-08).',
    type: () => [EntrenamientoAlertaRespuesta],
  })
  entrenamientos?: EntrenamientoAlertaRespuesta[];
}

/** Página de la bandeja de notificaciones del profesor (RN-NOT-03). */
@ApiSchema({
  name: 'Respuesta.PaginaNotificaciones',
  description: 'Página de la bandeja de notificaciones del profesor, con el total y no leídas.',
})
export class PaginaNotificacionesRespuesta {
  @ApiProperty({
    description: 'Notificaciones de la página, de la más nueva a la más vieja.',
    type: () => [NotificacionRespuesta],
  })
  items!: NotificacionRespuesta[];

  @ApiProperty({
    description: 'Cantidad total de notificaciones del profesor, en todas las páginas.',
    example: 23,
  })
  total!: number;

  @ApiProperty({ description: 'Número de página devuelta; arranca en 1.', example: 1 })
  pagina!: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página.',
    enum: [5, 10, 20, 50, 100],
    example: 10,
  })
  tamanio!: number;

  @ApiProperty({
    description:
      'Cantidad de notificaciones no leídas del profesor, sin contar la paginación (RN-NOT-03).',
    example: 4,
  })
  noLeidas!: number;
}

/** Cantidad de notificaciones no leídas del profesor (RN-NOT-03). */
@ApiSchema({
  name: 'Respuesta.NoLeidas',
  description: 'Cantidad de notificaciones no leídas del profesor.',
})
export class NoLeidasRespuesta {
  @ApiProperty({
    description:
      'Cantidad de notificaciones no leídas del profesor. Es 0 si el usuario no es profesor.',
    example: 4,
  })
  cantidad!: number;
}
