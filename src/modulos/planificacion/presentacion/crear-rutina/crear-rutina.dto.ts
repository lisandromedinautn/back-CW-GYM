import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
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

/** US06. Una lista vacía llega al dominio y responde RN-PLAN-01. */
export class CrearRutinaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques: BloqueDto[];
}
