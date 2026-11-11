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
  @IsUUID()
  ejercicioId: string;

  @IsInt()
  series: number;

  @IsInt()
  @Min(0)
  micropausaSegundos: number;

  @IsInt()
  @Min(0)
  macropausaSegundos: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  segundos?: number | null;

  @IsOptional()
  @IsPositive()
  pesoKg?: number | null;
}

/** Un ejercicio de un circuito: sin series ni pausas propias (RN-PLAN-03). */
export class EjercicioCircuitoDto {
  @IsUUID()
  ejercicioId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  segundos?: number | null;

  @IsOptional()
  @IsPositive()
  pesoKg?: number | null;
}

/**
 * Formato de entrada de un circuito (US09). `vueltas` no lleva @Min(1) y `ejercicios` no
 * exige un mínimo, para que 0 vueltas o un solo ejercicio respondan RN-PLAN-03 desde el dominio.
 */
export class CircuitoDto {
  @IsInt()
  vueltas: number;

  @IsInt()
  @Min(0)
  macropausaSegundos: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioCircuitoDto)
  ejercicios: EjercicioCircuitoDto[];
}

/**
 * US06 y US09: bloques y circuitos en listas separadas, las dos opcionales. Sin ninguno,
 * el dominio responde RN-PLAN-01.
 */
export class CrearRutinaDto {
  /** RN-PLAN-21: el largo lo valida el dominio (400 con código RN-PLAN-21). */
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques?: BloqueDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CircuitoDto)
  circuitos?: CircuitoDto[];
}

/** T08: cuerpo de PATCH /planificacion/rutinas/:id/nombre. El largo lo valida el dominio (RN-PLAN-21). */
export class RenombrarRutinaDto {
  @IsString()
  nombre: string;
}
