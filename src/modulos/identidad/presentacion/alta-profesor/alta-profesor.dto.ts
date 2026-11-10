import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Formato de entrada de US02. Las reglas (RN-IDE-04, 06, 13) las valida el dominio. */
export class AltaProfesorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsString()
  @MaxLength(20)
  tipoDocumento: string;

  @IsString()
  @MaxLength(30)
  numeroDocumento: string;

  @IsString()
  @MaxLength(30)
  legajo: string;

  @IsString()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  contrasenia: string;
}
