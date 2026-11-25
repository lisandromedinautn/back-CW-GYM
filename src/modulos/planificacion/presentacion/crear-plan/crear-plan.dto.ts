import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

/**
 * Un día del plan tal como llega del profesor. `rutinaId` null (o ausente) significa descanso
 * (RN-PLAN-10). El rango 1..28 y la ausencia de repetidos los valida el dominio (RN-PLAN-11).
 */
@ApiSchema({
  name: 'Dto.DiaPlan',
  description:
    'Día del plan tal como lo envía el profesor; sin rutina es descanso (RN-PLAN-10, RN-PLAN-11).',
})
export class DiaPlanDto {
  @ApiProperty({
    description:
      'Número del día dentro del plan, de 1 a 28. El Día N corresponde a inicio + (N − 1) días (RN-PLAN-11).',
    example: 1,
    type: 'integer',
    minimum: 1,
    maximum: 28,
  })
  @IsInt()
  numero: number;

  @ApiPropertyOptional({
    description:
      'Id de la rutina propia del profesor para ese día. Null o ausente significa día de descanso (RN-PLAN-10).',
    example: '9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a',
    type: 'string',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  rutinaId?: string | null;
}

/**
 * US07: cuerpo de POST /planificacion/planes. La fecha de fin no se recibe: se calcula sola
 * (RN-PLAN-09). Las reglas RN-PLAN-09 a 15 las valida el dominio y el caso de uso.
 */
@ApiSchema({
  name: 'Dto.CrearPlan',
  description:
    'Cuerpo de alta de plan: fecha de inicio, 28 días y alumnos (US07, RN-PLAN-09 a RN-PLAN-13).',
})
export class CrearPlanDto {
  @ApiProperty({
    description:
      'Fecha de inicio del plan (AAAA-MM-DD, UTC). La fecha de fin es inicio + 27 días y no es configurable (RN-PLAN-09).',
    example: '2026-12-01',
    format: 'date',
  })
  @IsString()
  fechaInicio: string;

  /** RN-PLAN-09: el dominio exige exactamente 28 días. */
  @ApiProperty({
    description: 'Los 28 días del plan. Cada uno tiene una rutina o es de descanso (RN-PLAN-10).',
    type: () => [DiaPlanDto],
    minItems: 28,
    maxItems: 28,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiaPlanDto)
  dias: DiaPlanDto[];

  /** RN-PLAN-12: el dominio exige al menos un alumno. */
  @ApiProperty({
    description:
      'Ids de los alumnos vinculados al profesor a los que se asigna el plan. Al menos uno (RN-PLAN-12, RN-PLAN-13).',
    type: [String],
    format: 'uuid',
    minItems: 1,
    example: ['3f2b9c1e-7a4d-4e8b-9c2f-1d5a6b7c8e90'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  alumnos: string[];
}
