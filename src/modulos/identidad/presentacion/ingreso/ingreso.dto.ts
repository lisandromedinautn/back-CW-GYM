import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

/** Sin IsEmail a propósito: RN-IDE-01 no dice qué dato falló, y un 400 por formato lo diría. */
export class IngresoDto {
  @ApiProperty({
    description:
      'Email con el que el usuario ingresa al sistema (RN-IDE-01). El formato no se valida aquí para no revelar qué dato falló.',
    example: 'alumno01@cwgym.com',
    maxLength: 254,
  })
  @IsString()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description:
      'Contraseña del usuario. Debe tener al menos 8 caracteres. Si las credenciales son inválidas, la respuesta no indica qué dato falló (RN-IDE-01).',
    example: 'Alumno#2026',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  contrasenia: string;
}
