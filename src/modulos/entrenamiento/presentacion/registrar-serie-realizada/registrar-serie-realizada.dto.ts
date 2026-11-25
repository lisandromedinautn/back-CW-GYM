import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

/** Solo valida formato: los rangos los valida el dominio (RN-ENT-03). */
@ApiSchema({
  name: 'Dto.RegistrarSerieRealizada',
  description: 'Cuerpo para registrar una serie realizada del entrenamiento.',
})
export class RegistrarSerieRealizadaDto {
  @ApiProperty({
    description:
      'Número de orden del bloque o del circuito dentro de la copia de la rutina del entrenamiento.',
    type: 'integer',
    example: 1,
  })
  @IsInt()
  orden: number;

  @ApiProperty({
    description:
      'Número de la serie dentro del bloque (1..series) o la vuelta del circuito (1..vueltas).',
    type: 'integer',
    minimum: 1,
    example: 2,
  })
  @IsInt()
  numero: number;

  @ApiPropertyOptional({
    description:
      'Posición del ejercicio dentro del circuito, desde 1. Solo se usa en circuitos; en bloques se omite.',
    type: 'integer',
    minimum: 1,
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  posicion?: number;

  @ApiPropertyOptional({
    description:
      'Repeticiones realizadas. Se informa cuando la serie prescripta es por repeticiones; si no corresponde, se ignora.',
    type: 'integer',
    minimum: 0,
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  repeticiones?: number;

  @ApiPropertyOptional({
    description:
      'Segundos realizados. Se informa cuando la serie prescripta es por tiempo; si no corresponde, se ignora.',
    type: 'integer',
    minimum: 0,
    example: 30,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  segundos?: number;

  @ApiPropertyOptional({
    description: 'Peso realizado en kilogramos, si la serie lo usa. Opcional y mayor o igual a 0.',
    type: 'number',
    minimum: 0,
    example: 30,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  pesoKg?: number;
}
