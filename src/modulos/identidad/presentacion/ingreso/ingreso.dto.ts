import { IsString, MaxLength } from 'class-validator';

/** Sin IsEmail a propósito: RN-IDE-01 no dice qué dato falló, y un 400 por formato lo diría. */
export class IngresoDto {
  @IsString()
  @MaxLength(254)
  email: string;

  @IsString()
  @MaxLength(200)
  contrasenia: string;
}
