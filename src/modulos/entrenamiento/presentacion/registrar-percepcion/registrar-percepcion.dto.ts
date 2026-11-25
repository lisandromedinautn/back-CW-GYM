import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/** Solo valida formato: los rangos los valida el dominio (RN-ENT-14 y RN-ENT-15). */
export class RegistrarPercepcionDto {
  @ApiProperty({
    description:
      'RPE (esfuerzo percibido) del entrenamiento, entero de 1 a 10 (RN-ENT-14). Se carga junto con la sensación de fuerza, una sola vez.',
    type: 'integer',
    minimum: 1,
    maximum: 10,
    example: 7,
  })
  @IsNumber()
  rpe: number;

  @ApiProperty({
    description:
      'Sensación de fuerza del alumno, entero de 1 a 5 (RN-ENT-15). Se carga junto con el RPE, una sola vez.',
    type: 'integer',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsNumber()
  sensacionFuerza: number;
}
