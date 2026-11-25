import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

/** Estado del plan según la fecha de hoy (RN-PLAN-15). */
export type EstadoPlanRespuesta = 'proximo' | 'vigente' | 'finalizado';

/** Un día del plan (RN-PLAN-10, 11): sin rutina es descanso. */
@ApiSchema({
  name: 'Entidad.DiaPlan',
  description:
    'Forma pública de un día del Plan de Entrenamiento: fecha, rutina o descanso (RN-PLAN-10, RN-PLAN-11).',
})
export class DiaPlanRespuesta {
  @ApiProperty({
    description: 'Número del día dentro del plan (1..28, RN-PLAN-11).',
    example: 1,
    minimum: 1,
    maximum: 28,
  })
  numero: number;

  @ApiProperty({
    description: 'Fecha calendario del día (RN-PLAN-10).',
    example: '2026-12-01',
    format: 'date',
  })
  fecha: string;

  @ApiProperty({
    description: 'Rutina asignada al día. Null si el día es de descanso (RN-PLAN-10).',
    example: '3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c',
    format: 'uuid',
    nullable: true,
    type: String,
  })
  rutinaId: string | null;

  @ApiProperty({
    description: 'Verdadero si el día no tiene rutina asignada (RN-PLAN-10).',
    example: false,
  })
  esDescanso: boolean;
}

/** Plan de Entrenamiento tal como lo recibe el front (US07). RN-PLAN-09 a 15. */
@ApiSchema({
  name: 'Entidad.Plan',
  description:
    'Forma pública del Plan de Entrenamiento: fechas, 28 días y alumnos asignados (RN-PLAN-09 a RN-PLAN-15).',
})
export class PlanRespuesta {
  @ApiProperty({
    description: 'Identificador del plan.',
    example: '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    format: 'uuid',
  })
  id: string;

  /** RN-PLAN-09: fecha de inicio del plan. */
  @ApiProperty({
    description: 'Fecha de inicio del plan (RN-PLAN-09).',
    example: '2026-12-01',
    format: 'date',
  })
  fechaInicio: string;

  /** RN-PLAN-09: fecha de fin calculada. */
  @ApiProperty({
    description: 'Fecha de fin calculada a partir de la de inicio (RN-PLAN-09).',
    example: '2026-12-28',
    format: 'date',
  })
  fechaFin: string;

  /** RN-PLAN-10, 11: cada día con su fecha; sin rutina es descanso. */
  @ApiProperty({
    description: 'Los 28 días del plan con su fecha, rutina o descanso (RN-PLAN-10, RN-PLAN-11).',
    type: [DiaPlanRespuesta],
  })
  dias: DiaPlanRespuesta[];

  @ApiProperty({
    description: 'Identificadores de los alumnos asignados al plan.',
    type: [String],
    example: ['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'],
    format: 'uuid',
  })
  alumnoIds: string[];
}

/** Resumen de un plan en el listado del profesor (RN-PLAN-22, RN-PLAN-15). */
@ApiSchema({
  name: 'Respuesta.ResumenPlan',
  description: 'Resumen de un plan en el listado del profesor (RN-PLAN-22, RN-PLAN-15).',
})
export class ResumenPlanRespuesta {
  @ApiProperty({
    description: 'Identificador del plan.',
    example: '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan (RN-PLAN-09).',
    example: '2026-12-01',
    format: 'date',
  })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin calculada del plan (RN-PLAN-09).',
    example: '2026-12-28',
    format: 'date',
  })
  fechaFin: string;

  /** RN-PLAN-15: estado según la fecha UTC del reloj. */
  @ApiProperty({
    description: 'Estado del plan según la fecha de hoy (RN-PLAN-15).',
    enum: ['proximo', 'vigente', 'finalizado'],
    example: 'vigente',
  })
  estado: EstadoPlanRespuesta;

  @ApiProperty({
    description: 'Identificadores de los alumnos asignados al plan.',
    type: [String],
    example: ['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'],
    format: 'uuid',
  })
  alumnoIds: string[];

  @ApiProperty({
    description: 'Cantidad de días del plan que tienen rutina asignada.',
    example: 24,
  })
  diasConRutina: number;

  @ApiProperty({
    description: 'Cantidad de días del plan que son de descanso (RN-PLAN-10).',
    example: 4,
  })
  diasDeDescanso: number;
}

/** Una página del listado de planes del profesor. `pagina` arranca en 1. */
@ApiSchema({
  name: 'Respuesta.PaginaPlanes',
  description: 'Una página del listado de planes del profesor.',
})
export class PaginaPlanesRespuesta {
  @ApiProperty({ description: 'Planes de la página solicitada.', type: [ResumenPlanRespuesta] })
  items: ResumenPlanRespuesta[];

  @ApiProperty({ description: 'Cantidad total de planes que cumplen los filtros.', example: 12 })
  total: number;

  @ApiProperty({ description: 'Número de página devuelta (arranca en 1).', example: 1 })
  pagina: number;

  @ApiProperty({ description: 'Cantidad de planes por página.', example: 10 })
  tamanio: number;
}

/** Detalle de un plan propio con sus 28 días (US22). */
@ApiSchema({
  name: 'Respuesta.DetallePlan',
  description: 'Detalle de un plan propio con sus 28 días (US22).',
})
export class DetallePlanRespuesta {
  @ApiProperty({
    description: 'Identificador del plan.',
    example: '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan (RN-PLAN-09).',
    example: '2026-12-01',
    format: 'date',
  })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin calculada del plan (RN-PLAN-09).',
    example: '2026-12-28',
    format: 'date',
  })
  fechaFin: string;

  @ApiProperty({
    description: 'Estado del plan según la fecha de hoy (RN-PLAN-15).',
    enum: ['proximo', 'vigente', 'finalizado'],
    example: 'proximo',
  })
  estado: EstadoPlanRespuesta;

  @ApiProperty({
    description: 'Los 28 días del plan (RN-PLAN-10, RN-PLAN-11).',
    type: [DiaPlanRespuesta],
  })
  dias: DiaPlanRespuesta[];
}

/** Día del plan tras editar su rutina (RN-PLAN-23). */
@ApiSchema({
  name: 'Respuesta.DiaEditado',
  description: 'Día del plan tras editar su rutina (RN-PLAN-23).',
})
export class DiaEditadoRespuesta {
  @ApiProperty({
    description: 'Número del día editado dentro del plan (1..28, RN-PLAN-11).',
    example: 5,
    minimum: 1,
    maximum: 28,
  })
  numero: number;

  @ApiProperty({
    description: 'Fecha calendario del día (RN-PLAN-10).',
    example: '2026-12-05',
    format: 'date',
  })
  fecha: string;

  @ApiProperty({
    description: 'Nueva rutina del día. Null si queda como descanso (RN-PLAN-23).',
    example: '3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c',
    format: 'uuid',
    nullable: true,
    type: String,
  })
  rutinaId: string | null;

  @ApiProperty({
    description: 'Verdadero si el día queda sin rutina (RN-PLAN-10).',
    example: false,
  })
  esDescanso: boolean;
}

/** Alumnos asignados a un plan (RN-PLAN-22). */
@ApiSchema({
  name: 'Respuesta.AlumnosDelPlan',
  description: 'Alumnos asignados a un plan (RN-PLAN-22).',
})
export class AlumnosDelPlanRespuesta {
  @ApiProperty({
    description: 'Identificadores de los alumnos asignados al plan.',
    type: [String],
    example: ['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'],
    format: 'uuid',
  })
  alumnoIds: string[];
}

/** Ejercicio con su nombre de catálogo resuelto (US08). */
@ApiSchema({
  name: 'Respuesta.EjercicioDelPlanAlumno',
  description: 'Ejercicio con su nombre de catálogo resuelto (US08).',
})
export class EjercicioDelPlanAlumnoRespuesta {
  @ApiProperty({
    description: 'Identificador del ejercicio en el catálogo.',
    example: '5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b',
    format: 'uuid',
  })
  ejercicioId: string;

  @ApiProperty({
    description: 'Nombre del ejercicio según el catálogo.',
    example: 'Sentadilla con barra',
  })
  nombre: string;

  @ApiProperty({
    description: 'Repeticiones objetivo. Null si el ejercicio se mide por tiempo o peso.',
    example: 10,
    nullable: true,
    type: Number,
  })
  repeticiones: number | null;

  @ApiProperty({
    description: 'Segundos objetivo. Null si el ejercicio se mide por repeticiones.',
    example: null,
    nullable: true,
    type: Number,
  })
  segundos: number | null;

  @ApiProperty({
    description: 'Peso objetivo en kilogramos. Null si no hay peso prescripto.',
    example: 40,
    nullable: true,
    type: Number,
  })
  pesoKg: number | null;
}

/** Bloque de la rutina del día del alumno (RN-PLAN-02). */
@ApiSchema({
  name: 'Respuesta.BloqueDelPlanAlumno',
  description: 'Bloque de la rutina del día del alumno (RN-PLAN-02).',
})
export class BloqueDelPlanAlumnoRespuesta extends EjercicioDelPlanAlumnoRespuesta {
  @ApiProperty({ description: 'Cantidad de series del bloque.', example: 3 })
  series: number;

  @ApiProperty({ description: 'Pausa entre series, en segundos.', example: 60 })
  micropausaSegundos: number;

  @ApiProperty({ description: 'Pausa entre bloques, en segundos.', example: 120 })
  macropausaSegundos: number;
}

/** Circuito de la rutina del día del alumno (RN-PLAN-03). */
@ApiSchema({
  name: 'Respuesta.CircuitoDelPlanAlumno',
  description: 'Circuito de la rutina del día del alumno (RN-PLAN-03).',
})
export class CircuitoDelPlanAlumnoRespuesta {
  @ApiProperty({ description: 'Cantidad de vueltas del circuito.', example: 3 })
  vueltas: number;

  @ApiProperty({ description: 'Pausa entre vueltas del circuito, en segundos.', example: 90 })
  macropausaSegundos: number;

  @ApiProperty({
    description: 'Ejercicios del circuito con su nombre resuelto.',
    type: [EjercicioDelPlanAlumnoRespuesta],
  })
  ejercicios: EjercicioDelPlanAlumnoRespuesta[];
}

/** La rutina del día del alumno con los nombres de sus ejercicios (US08, RN-PLAN-21). */
@ApiSchema({
  name: 'Respuesta.RutinaDelPlanAlumno',
  description: 'Rutina del día del alumno con los nombres de sus ejercicios (US08, RN-PLAN-21).',
})
export class RutinaDelPlanAlumnoRespuesta {
  @ApiProperty({
    description: 'Identificador de la rutina.',
    example: '3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c',
    format: 'uuid',
  })
  id: string;

  /** RN-PLAN-21. */
  @ApiProperty({
    description: 'Nombre de la rutina (RN-PLAN-21).',
    example: 'Fuerza tren superior A',
  })
  nombre: string;

  @ApiProperty({ description: 'Tipo de rutina.', example: 'mixta' })
  tipo: string;

  @ApiProperty({
    description: 'Bloques de la rutina (RN-PLAN-02).',
    type: [BloqueDelPlanAlumnoRespuesta],
  })
  bloques: BloqueDelPlanAlumnoRespuesta[];

  @ApiProperty({
    description: 'Circuitos de la rutina (RN-PLAN-03).',
    type: [CircuitoDelPlanAlumnoRespuesta],
  })
  circuitos: CircuitoDelPlanAlumnoRespuesta[];
}

/** Día del plan visto por el alumno (RN-PLAN-11, 15, 19). */
@ApiSchema({
  name: 'Respuesta.DiaDelPlanAlumno',
  description: 'Día del plan visto por el alumno (RN-PLAN-11, RN-PLAN-15, RN-PLAN-19).',
})
export class DiaDelPlanAlumnoRespuesta {
  @ApiProperty({
    description: 'Número del día dentro del plan (1..28, RN-PLAN-11).',
    example: 1,
    minimum: 1,
    maximum: 28,
  })
  numero: number;

  @ApiProperty({
    description: 'Fecha calendario del día (RN-PLAN-10).',
    example: '2026-12-01',
    format: 'date',
  })
  fecha: string;

  @ApiProperty({
    description: 'Rutina del día. Null si el día es de descanso (RN-PLAN-10).',
    type: RutinaDelPlanAlumnoRespuesta,
    nullable: true,
  })
  rutina: RutinaDelPlanAlumnoRespuesta | null;
}

/** Plan vigente del alumno con sus días (RN-PLAN-19). */
@ApiSchema({
  name: 'Respuesta.PlanVigenteAlumno',
  description: 'Plan vigente del alumno con sus días (RN-PLAN-19).',
})
export class PlanVigenteAlumnoRespuesta {
  @ApiProperty({
    description: 'Identificador del plan.',
    example: '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan (RN-PLAN-09).',
    example: '2026-12-01',
    format: 'date',
  })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin calculada del plan (RN-PLAN-09).',
    example: '2026-12-28',
    format: 'date',
  })
  fechaFin: string;

  @ApiProperty({
    description: 'Los 28 días del plan con su rutina o descanso.',
    type: [DiaDelPlanAlumnoRespuesta],
  })
  dias: DiaDelPlanAlumnoRespuesta[];
}

/**
 * Resultado de `GET planificacion/mi-plan` (US11, RN-PLAN-11, 15, 19).
 * Es una unión discriminada por `estado` en el caso de uso: con `estado: 'sin-plan'` solo viene
 * `fecha`; con `estado: 'plan'` viene también `plan`. Por eso `plan` es opcional y nullable.
 */
@ApiSchema({
  name: 'Respuesta.PlanDelAlumno',
  description:
    'Resultado de mi-plan del alumno: sin plan o plan vigente (US11, RN-PLAN-11, RN-PLAN-15, RN-PLAN-19).',
})
export class PlanDelAlumnoRespuesta {
  @ApiProperty({
    description: 'Indica si el alumno tiene un plan vigente hoy o no.',
    enum: ['sin-plan', 'plan'],
    example: 'plan',
  })
  estado: 'sin-plan' | 'plan';

  @ApiProperty({
    description: 'Fecha de hoy usada para resolver el plan (RN-PLAN-15).',
    example: '2026-12-10',
    format: 'date',
  })
  fecha: string;

  @ApiPropertyOptional({
    description: 'Plan vigente del alumno. Solo viene cuando `estado` es `plan`; si no, es null.',
    type: PlanVigenteAlumnoRespuesta,
    nullable: true,
  })
  plan?: PlanVigenteAlumnoRespuesta | null;
}
