import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Formato de entrada de un bloque. Solo valida formato (decidido el 08/11/2026): las reglas
 * RN-PLAN-02, 04 y 05 las valida el dominio y responden con su código.
 * `series` no lleva @Min(1) para que 0 llegue al dominio y responda RN-PLAN-02.
 */
export class BloqueDto {
  /** US10: posición en la rutina. Que sea 1..N sin repetir ni saltear lo valida el dominio (RN-PLAN-01). */
  @ApiPropertyOptional({
    description:
      'Posición del bloque en la rutina (1..N). Si se usa, tiene que venir en todos los bloques y circuitos (RN-PLAN-01).',
    example: 1,
    type: 'integer',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiProperty({
    description: 'Id del ejercicio del catálogo que se prescribe en el bloque (RN-PLAN-06).',
    example: '6b5a4c3d-2e1f-4a0b-9c8d-7e6f5a4b3c2d',
    format: 'uuid',
  })
  @IsUUID()
  ejercicioId: string;

  @ApiProperty({
    description: 'Cantidad de series del bloque, mayor o igual a 1 (RN-PLAN-02).',
    example: 3,
    type: 'integer',
    minimum: 1,
  })
  @IsInt()
  series: number;

  @ApiProperty({
    description: 'Pausa entre series, en segundos enteros (RN-PLAN-02).',
    example: 60,
    type: 'integer',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  micropausaSegundos: number;

  @ApiProperty({
    description: 'Pausa al final del bloque, en segundos enteros (RN-PLAN-02).',
    example: 120,
    type: 'integer',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  macropausaSegundos: number;

  @ApiPropertyOptional({
    description:
      'Repeticiones por serie. Va solo si el ejercicio es por repeticiones; excluyente con segundos (RN-PLAN-04).',
    example: 12,
    type: 'integer',
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number | null;

  @ApiPropertyOptional({
    description:
      'Duración de cada serie en segundos. Va solo si el ejercicio es por tiempo; excluyente con repeticiones (RN-PLAN-04).',
    example: 45,
    type: 'integer',
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  segundos?: number | null;

  @ApiPropertyOptional({
    description:
      'Peso en kilogramos. Se indica solo si la carga del ejercicio incluye Peso Extra, y aun así es opcional (RN-PLAN-05).',
    example: 20.5,
    type: 'number',
    minimum: 0,
    exclusiveMinimum: true,
    nullable: true,
  })
  @IsOptional()
  @IsPositive()
  pesoKg?: number | null;
}

/** Un ejercicio de un circuito: sin series ni pausas propias (RN-PLAN-03). */
export class EjercicioCircuitoDto {
  @ApiProperty({
    description:
      'Id del ejercicio del catálogo que forma parte del circuito (RN-PLAN-06). No puede repetirse dentro del mismo circuito (RN-PLAN-20).',
    example: '6b5a4c3d-2e1f-4a0b-9c8d-7e6f5a4b3c2d',
    format: 'uuid',
  })
  @IsUUID()
  ejercicioId: string;

  @ApiPropertyOptional({
    description:
      'Repeticiones por vuelta. Va solo si el ejercicio es por repeticiones (RN-PLAN-04).',
    example: 10,
    type: 'integer',
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number | null;

  @ApiPropertyOptional({
    description:
      'Duración en segundos por vuelta. Va solo si el ejercicio es por tiempo (RN-PLAN-04).',
    example: 30,
    type: 'integer',
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  segundos?: number | null;

  @ApiPropertyOptional({
    description:
      'Peso en kilogramos. Se indica solo si la carga del ejercicio incluye Peso Extra, y aun así es opcional (RN-PLAN-05).',
    example: 10,
    type: 'number',
    minimum: 0,
    exclusiveMinimum: true,
    nullable: true,
  })
  @IsOptional()
  @IsPositive()
  pesoKg?: number | null;
}

/**
 * Formato de entrada de un circuito (US09). `vueltas` no lleva @Min(1) y `ejercicios` no
 * exige un mínimo, para que 0 vueltas o un solo ejercicio respondan RN-PLAN-03 desde el dominio.
 */
export class CircuitoDto {
  /** US10: posición en la rutina. Que sea 1..N sin repetir ni saltear lo valida el dominio (RN-PLAN-01). */
  @ApiPropertyOptional({
    description:
      'Posición del circuito en la rutina (1..N). Si se usa, tiene que venir en todos los bloques y circuitos (RN-PLAN-01).',
    example: 2,
    type: 'integer',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiProperty({
    description:
      'Cantidad de vueltas del circuito. Cada vuelta es una serie y termina con macropausa (RN-PLAN-03).',
    example: 3,
    type: 'integer',
    minimum: 1,
  })
  @IsInt()
  vueltas: number;

  @ApiProperty({
    description:
      'Pausa al final de cada vuelta, en segundos enteros. El circuito no tiene micropausas (RN-PLAN-03).',
    example: 90,
    type: 'integer',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  macropausaSegundos: number;

  @ApiProperty({
    description:
      'Ejercicios del circuito, en orden, sin descanso entre ellos. Son 2 o más (RN-PLAN-03).',
    type: () => [EjercicioCircuitoDto],
    minItems: 2,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioCircuitoDto)
  ejercicios: EjercicioCircuitoDto[];
}

/**
 * US06, US09 y US10: bloques y circuitos en listas separadas, las dos opcionales. Sin ninguno,
 * el dominio responde RN-PLAN-01. En una rutina mixta, `orden` ubica cada uno en la secuencia.
 */
export class CrearRutinaDto {
  /** RN-PLAN-21: el largo lo valida el dominio (400 con código RN-PLAN-21). */
  @ApiPropertyOptional({
    description:
      'Nombre de la rutina, de 1 a 60 caracteres sin contar espacios de los extremos (se guarda recortado). Si no se indica, se llama `Rutina N`. No puede repetirse entre las rutinas del mismo profesor, sin distinguir mayúsculas (RN-PLAN-21).',
    example: 'Fuerza tren superior',
    minLength: 1,
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Bloques de la rutina. Sin bloques ni circuitos, responde RN-PLAN-01.',
    type: () => [BloqueDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques?: BloqueDto[];

  @ApiPropertyOptional({
    description: 'Circuitos de la rutina. Sin bloques ni circuitos, responde RN-PLAN-01.',
    type: () => [CircuitoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CircuitoDto)
  circuitos?: CircuitoDto[];
}

/** T08: cuerpo de PATCH /planificacion/rutinas/:id/nombre. El largo lo valida el dominio (RN-PLAN-21). */
export class RenombrarRutinaDto {
  @ApiProperty({
    description:
      'Nombre nuevo de la rutina: 1 a 60 caracteres sin contar los espacios de los extremos; ' +
      'único por profesor sin distinguir mayúsculas (RN-PLAN-21).',
    example: 'Fuerza tren superior',
    minLength: 1,
    maxLength: 60,
  })
  @IsString()
  nombre: string;
}
