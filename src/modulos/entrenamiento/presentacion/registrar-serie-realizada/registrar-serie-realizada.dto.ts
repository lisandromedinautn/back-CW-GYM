import { IsInt, IsNumber, IsOptional } from 'class-validator';

/** Solo valida formato: los rangos los valida el dominio (RN-ENT-03). */
export class RegistrarSerieRealizadaDto {
  @IsInt()
  orden: number;

  @IsInt()
  numero: number;

  @IsOptional()
  @IsInt()
  posicion?: number;

  @IsOptional()
  @IsInt()
  repeticiones?: number;

  @IsOptional()
  @IsInt()
  segundos?: number;

  @IsOptional()
  @IsNumber()
  pesoKg?: number;
}
