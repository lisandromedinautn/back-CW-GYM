import { IsNumber } from 'class-validator';

/** Solo valida formato: los rangos los valida el dominio (RN-ENT-14 y RN-ENT-15). */
export class RegistrarPercepcionDto {
  @IsNumber()
  rpe: number;

  @IsNumber()
  sensacionFuerza: number;
}
