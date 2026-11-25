import { ApiProperty } from '@nestjs/swagger';

/** Ejercicio tal como lo recibe el front (RN-CAT-01, 05, 09). */
export class EjercicioRespuesta {
  @ApiProperty({
    description: 'Identificador único del ejercicio.',
    example: '3f2b8c1e-6d4a-4b7e-9c2f-1a5e8d7b9c01',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del ejercicio.',
    example: 'Flexiones de brazos',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción de cómo se realiza el ejercicio.',
    example:
      'Apoyado boca abajo con las manos a la altura de los hombros, bajá el pecho y volvé a subir.',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Tipo de ejercicio: "por tiempo" o "por repeticiones" (RN-CAT-02).',
    example: 'por repeticiones',
  })
  tipo: string;

  @ApiProperty({
    description:
      'Tipo de carga: "Sin Peso", "Peso Corporal", "Peso Extra" o "Peso Corporal + Peso Extra" (RN-CAT-03).',
    example: 'Peso Corporal',
  })
  tipoCarga: string;

  @ApiProperty({
    description:
      'Porcentaje del peso corporal que se suma a la carga (RN-CAT-04, 06). Vale null si el tipo de carga no incluye peso corporal.',
    example: 100,
    type: Number,
    nullable: true,
  })
  factorPesoCorporal: number | null;

  @ApiProperty({
    description: 'Músculo principal que trabaja el ejercicio (RN-CAT-05).',
    example: 'Pectoral',
  })
  musculoPrincipal: string;

  @ApiProperty({
    description: 'Grupo muscular al que pertenece el músculo principal (RN-CAT-05).',
    example: 'Pecho',
  })
  grupoMuscular: string;

  @ApiProperty({
    description:
      'Músculo secundario que participa en el ejercicio. Vale null si no tiene (RN-CAT-01).',
    example: 'Tríceps',
    type: String,
    nullable: true,
  })
  musculoSecundario: string | null;

  @ApiProperty({
    description:
      'URL de la animación GIF del ejercicio, alojada en el dataset de origen (RN-CAT-08).',
    example: 'https://gymvisual.com/img/pushups.gif',
  })
  urlGif: string;

  @ApiProperty({
    description: 'Atribución del autor o fuente de la animación del ejercicio.',
    example: '© Gym visual — https://gymvisual.com/',
  })
  atribucion: string;
}

/** Una página de la consulta de ejercicios. `pagina` arranca en 1. */
export class PaginaEjerciciosRespuesta {
  @ApiProperty({
    description: 'Ejercicios de la página solicitada.',
    type: [EjercicioRespuesta],
  })
  items: EjercicioRespuesta[];

  @ApiProperty({
    description: 'Cantidad total de ejercicios que cumplen los filtros de la consulta.',
    example: 137,
  })
  total: number;

  @ApiProperty({
    description: 'Número de página consultada. Arranca en 1.',
    example: 1,
  })
  pagina: number;

  @ApiProperty({
    description: 'Cantidad de ejercicios por página (por defecto 20).',
    example: 20,
  })
  tamanio: number;
}
