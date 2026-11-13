import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

/**
 * Un día del plan tal como llega del profesor. `rutinaId` null (o ausente) significa descanso
 * (RN-PLAN-10). El rango 1..28 y la ausencia de repetidos los valida el dominio (RN-PLAN-11).
 */
export class DiaPlanDto {
  @IsInt()
  numero: number;

  @IsOptional()
  @IsUUID()
  rutinaId?: string | null;
}

/**
 * US07: cuerpo de POST /planificacion/planes. La fecha de fin no se recibe: se calcula sola
 * (RN-PLAN-09). Las reglas RN-PLAN-09 a 15 las valida el dominio y el caso de uso.
 */
export class CrearPlanDto {
  @IsString()
  fechaInicio: string;

  /** RN-PLAN-09: el dominio exige exactamente 28 días. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiaPlanDto)
  dias: DiaPlanDto[];

  /** RN-PLAN-12: el dominio exige al menos un alumno. */
  @IsArray()
  @IsUUID('all', { each: true })
  alumnos: string[];
}
