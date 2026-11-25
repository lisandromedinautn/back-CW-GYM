import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

/** Bloque (ejercicio prescripto con series) de una rutina. RN-PLAN-01, 02. */
@ApiSchema({
  name: 'Entidad.Bloque',
  description:
    'Forma pública del bloque de una rutina: ejercicio prescripto con series y pausas. RN-PLAN-01, 02.',
})
export class BloqueRutinaRespuesta {
  @ApiProperty({
    description:
      'Posición del bloque en la rutina, de 1 a N. RN-PLAN-01: los bloques y circuitos comparten la misma secuencia de orden.',
    example: 1,
    type: Number,
  })
  orden!: number;

  @ApiProperty({
    description: 'Identificador del ejercicio del catálogo.',
    example: '3f2c1a9e-7b4d-4e8a-9c1f-2a6d5b8e0f11',
    format: 'uuid',
    type: String,
  })
  ejercicioId!: string;

  @ApiProperty({
    description: 'Cantidad de series a realizar del ejercicio. RN-PLAN-02.',
    example: 3,
    type: Number,
  })
  series!: number;

  @ApiProperty({
    description: 'Pausa en segundos entre series del mismo bloque. RN-PLAN-02.',
    example: 60,
    type: Number,
  })
  micropausaSegundos!: number;

  @ApiProperty({
    description: 'Pausa en segundos al terminar el bloque, antes del siguiente. RN-PLAN-02.',
    example: 90,
    type: Number,
  })
  macropausaSegundos!: number;

  @ApiProperty({
    description:
      'Repeticiones objetivo del ejercicio. Null cuando el objetivo se expresa en segundos o no aplica.',
    example: 12,
    nullable: true,
    type: Number,
  })
  repeticiones!: number | null;

  @ApiProperty({
    description:
      'Duración objetivo del ejercicio en segundos. Null cuando el objetivo se expresa en repeticiones.',
    example: null,
    nullable: true,
    type: Number,
  })
  segundos!: number | null;

  @ApiProperty({
    description: 'Peso objetivo en kilogramos. Null si el ejercicio no tiene carga prescripta.',
    example: 20,
    nullable: true,
    type: Number,
  })
  pesoKg!: number | null;
}

/** Ejercicio dentro de un circuito. Un circuito no tiene micropausa propia (RN-PLAN-03). */
@ApiSchema({
  name: 'Entidad.EjercicioPrescripto',
  description:
    'Forma pública del ejercicio prescripto dentro de un circuito, sin series ni pausas propias. RN-PLAN-03.',
})
export class EjercicioCircuitoRespuesta {
  @ApiProperty({
    description: 'Identificador del ejercicio del catálogo.',
    example: '8d4e2b7a-1c3f-4a9e-b6d2-5f7a0c9e3b24',
    format: 'uuid',
    type: String,
  })
  ejercicioId!: string;

  @ApiProperty({
    description: 'Repeticiones objetivo del ejercicio dentro de cada vuelta. Null si no aplica.',
    example: 15,
    nullable: true,
    type: Number,
  })
  repeticiones!: number | null;

  @ApiProperty({
    description: 'Duración objetivo del ejercicio en segundos. Null si no aplica.',
    example: null,
    nullable: true,
    type: Number,
  })
  segundos!: number | null;

  @ApiProperty({
    description: 'Peso objetivo en kilogramos. Null si el ejercicio no tiene carga prescripta.',
    example: 8,
    nullable: true,
    type: Number,
  })
  pesoKg!: number | null;
}

/** Circuito de una rutina: grupo de ejercicios que se repite por vueltas. RN-PLAN-03. */
@ApiSchema({
  name: 'Entidad.Circuito',
  description:
    'Forma pública del circuito de una rutina: grupo de ejercicios repetido por vueltas. RN-PLAN-03.',
})
export class CircuitoRutinaRespuesta {
  @ApiProperty({
    description:
      'Posición del circuito en la rutina, de 1 a N. RN-PLAN-01: comparte la secuencia de orden con los bloques.',
    example: 2,
    type: Number,
  })
  orden!: number;

  @ApiProperty({
    description: 'Cantidad de vueltas que se completan con todos los ejercicios del circuito.',
    example: 3,
    type: Number,
  })
  vueltas!: number;

  @ApiProperty({
    description:
      'Pausa en segundos al terminar cada vuelta completa. RN-PLAN-03: el circuito no tiene micropausa.',
    example: 120,
    type: Number,
  })
  macropausaSegundos!: number;

  @ApiProperty({
    description: 'Ejercicios del circuito, en el orden en que se ejecutan dentro de cada vuelta.',
    type: () => [EjercicioCircuitoRespuesta],
  })
  ejercicios!: EjercicioCircuitoRespuesta[];
}

/**
 * Rutina tal como la recibe el front. Documenta `RutinaRespuesta` del controlador de
 * planificación (listado, detalle, creación, edición, renombrado e importación).
 */
@ApiSchema({
  name: 'Entidad.Rutina',
  description: 'Forma pública de la rutina del profesor, con sus bloques y circuitos. RN-PLAN-01.',
})
export class RutinaRespuesta {
  @ApiProperty({
    description: 'Identificador único de la rutina.',
    example: 'b5e7c3d1-9a2f-4b6e-8d0c-1f3a5e7b9c20',
    format: 'uuid',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description:
      'Nombre de la rutina, único por profesor. Se puede cambiar sin modificar su contenido. RN-PLAN-21.',
    example: 'Fuerza tren superior A',
    type: String,
  })
  nombre!: string;

  @ApiProperty({
    description: 'Tipo de rutina tal como lo define el dominio.',
    example: 'fuerza',
    type: String,
  })
  tipo!: string;

  @ApiProperty({
    description:
      'Bloques de ejercicios con series, micropausas y macropausas. Cada uno lleva su `orden` dentro de la rutina. RN-PLAN-01, 02.',
    type: () => [BloqueRutinaRespuesta],
  })
  bloques!: BloqueRutinaRespuesta[];

  @ApiProperty({
    description:
      'Circuitos de la rutina, cada uno con sus vueltas y su macropausa. Un circuito no tiene micropausa. RN-PLAN-03.',
    type: () => [CircuitoRutinaRespuesta],
  })
  circuitos!: CircuitoRutinaRespuesta[];
}

/**
 * Una página de la consulta de rutinas del profesor (RN-PLAN-08: solo sus propias rutinas).
 * Documenta `PaginaRutinasRespuesta` del controlador de planificación.
 */
@ApiSchema({
  name: 'Respuesta.PaginaRutinas',
  description: 'Página del listado de rutinas propias del profesor. RN-PLAN-08.',
})
export class PaginaRutinasRespuesta {
  @ApiProperty({
    description: 'Rutinas de la página solicitada.',
    type: () => [RutinaRespuesta],
  })
  items!: RutinaRespuesta[];

  @ApiProperty({
    description: 'Cantidad total de rutinas propias del profesor, sin paginar.',
    example: 27,
    type: Number,
  })
  total!: number;

  @ApiProperty({
    description: 'Número de página consultada. Arranca en 1.',
    example: 1,
    type: Number,
  })
  pagina!: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página.',
    example: 10,
    type: Number,
  })
  tamanio!: number;
}

/** Ejercicio prescripto con su nombre del catálogo ya resuelto. Rutina del día (US08). */
@ApiSchema({
  name: 'Respuesta.EjercicioDeLaRutina',
  description: 'Ejercicio de la rutina del día con su nombre del catálogo resuelto (US08).',
})
export class EjercicioDeLaRutinaRespuesta {
  @ApiProperty({
    description: 'Identificador del ejercicio del catálogo.',
    example: '3f2c1a9e-7b4d-4e8a-9c1f-2a6d5b8e0f11',
    format: 'uuid',
    type: String,
  })
  ejercicioId!: string;

  @ApiProperty({
    description:
      'Nombre del ejercicio resuelto desde el catálogo. Si no se encuentra, se devuelve el identificador.',
    example: 'Press de banca con mancuernas',
    type: String,
  })
  nombre!: string;

  @ApiProperty({
    description: 'Repeticiones objetivo. Null si no aplica.',
    example: 10,
    nullable: true,
    type: Number,
  })
  repeticiones!: number | null;

  @ApiProperty({
    description: 'Duración objetivo en segundos. Null si no aplica.',
    example: null,
    nullable: true,
    type: Number,
  })
  segundos!: number | null;

  @ApiProperty({
    description: 'Peso objetivo en kilogramos. Null si no tiene carga prescripta.',
    example: 16,
    nullable: true,
    type: Number,
  })
  pesoKg!: number | null;
}

/**
 * Bloque de la rutina del día. No incluye `orden`: `ConsultarRutinaDelDia` lo quita antes de
 * responder al alumno.
 */
@ApiSchema({
  name: 'Respuesta.BloqueDeLaRutina',
  description: 'Bloque de la rutina del día, sin orden, para el alumno. RN-PLAN-02.',
})
export class BloqueDeLaRutinaRespuesta extends EjercicioDeLaRutinaRespuesta {
  @ApiProperty({
    description: 'Cantidad de series a realizar del ejercicio. RN-PLAN-02.',
    example: 3,
    type: Number,
  })
  series!: number;

  @ApiProperty({
    description: 'Pausa en segundos entre series del mismo bloque. RN-PLAN-02.',
    example: 60,
    type: Number,
  })
  micropausaSegundos!: number;

  @ApiProperty({
    description: 'Pausa en segundos al terminar el bloque. RN-PLAN-02.',
    example: 90,
    type: Number,
  })
  macropausaSegundos!: number;
}

/**
 * Circuito de la rutina del día. No incluye `orden` (se quita en la respuesta al alumno) ni
 * micropausa (RN-PLAN-03).
 */
@ApiSchema({
  name: 'Respuesta.CircuitoDeLaRutina',
  description: 'Circuito de la rutina del día, sin orden, para el alumno. RN-PLAN-03.',
})
export class CircuitoDeLaRutinaRespuesta {
  @ApiProperty({
    description: 'Cantidad de vueltas del circuito.',
    example: 3,
    type: Number,
  })
  vueltas!: number;

  @ApiProperty({
    description: 'Pausa en segundos al terminar cada vuelta. RN-PLAN-03.',
    example: 120,
    type: Number,
  })
  macropausaSegundos!: number;

  @ApiProperty({
    description: 'Ejercicios del circuito con su nombre resuelto, en orden de ejecución.',
    type: () => [EjercicioDeLaRutinaRespuesta],
  })
  ejercicios!: EjercicioDeLaRutinaRespuesta[];
}

/** Rutina del día del alumno, con los nombres de sus ejercicios resueltos (US08). */
@ApiSchema({
  name: 'Respuesta.RutinaParaAlumno',
  description: 'Rutina del día del alumno con los nombres de sus ejercicios resueltos (US08).',
})
export class RutinaParaAlumnoRespuesta {
  @ApiProperty({
    description: 'Identificador único de la rutina.',
    example: 'b5e7c3d1-9a2f-4b6e-8d0c-1f3a5e7b9c20',
    format: 'uuid',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre de la rutina. RN-PLAN-21.',
    example: 'Fuerza tren superior A',
    type: String,
  })
  nombre!: string;

  @ApiProperty({
    description: 'Tipo de rutina tal como lo define el dominio.',
    example: 'fuerza',
    type: String,
  })
  tipo!: string;

  @ApiProperty({
    description: 'Bloques de la rutina del día, sin `orden`, con el nombre de cada ejercicio.',
    type: () => [BloqueDeLaRutinaRespuesta],
  })
  bloques!: BloqueDeLaRutinaRespuesta[];

  @ApiProperty({
    description: 'Circuitos de la rutina del día, sin `orden`, con el nombre de cada ejercicio.',
    type: () => [CircuitoDeLaRutinaRespuesta],
  })
  circuitos!: CircuitoDeLaRutinaRespuesta[];
}

/**
 * Respuesta de `GET /planificacion/mi-rutina-del-dia` (RN-PLAN-18). Es una unión discriminada
 * por `estado`; el front debe mirar `estado` antes de leer el resto:
 * - `estado: 'rutina'`: hay plan vigente con rutina para la fecha. Vienen `numeroDia` y `rutina`.
 * - `estado: 'descanso'`: el día del plan no tiene rutina asignada (RN-PLAN-10). Viene `numeroDia`
 *   y `rutina` es null.
 * - `estado: 'sin-plan'`: el alumno no tiene plan vigente para la fecha, o no está vinculado a un
 *   alumno. Solo vienen `fecha`, `numeroDia` y `rutina` como null.
 * La `fecha` siempre es la del reloj del sistema (RN-PLAN-15), en formato ISO `AAAA-MM-DD`.
 */
@ApiSchema({
  name: 'Respuesta.RutinaDelDia',
  description: 'Respuesta de la rutina del día: rutina, descanso o sin plan vigente. RN-PLAN-18.',
})
export class RutinaDelDiaRespuesta {
  @ApiProperty({
    description:
      'Discriminador de la respuesta. `rutina`: hay rutina para hoy. `descanso`: día sin rutina (RN-PLAN-10). `sin-plan`: no hay plan vigente para la fecha.',
    enum: ['rutina', 'descanso', 'sin-plan'],
    example: 'rutina',
  })
  estado!: 'rutina' | 'descanso' | 'sin-plan';

  @ApiProperty({
    description:
      'Fecha consultada según el reloj del sistema, en formato ISO AAAA-MM-DD (RN-PLAN-15).',
    example: '2026-11-25',
    type: String,
  })
  fecha!: string;

  @ApiPropertyOptional({
    description:
      'Número del día dentro del plan (1 a 28) que corresponde a la fecha (RN-PLAN-11). Presente con `estado` `rutina` o `descanso`; null o ausente con `sin-plan`.',
    example: 5,
    nullable: true,
    type: Number,
  })
  numeroDia?: number | null;

  @ApiPropertyOptional({
    description:
      'Rutina del día con los nombres de sus ejercicios. Presente solo con `estado` `rutina`; null con `descanso` y `sin-plan`.',
    nullable: true,
    type: () => RutinaParaAlumnoRespuesta,
  })
  rutina?: RutinaParaAlumnoRespuesta | null;
}
