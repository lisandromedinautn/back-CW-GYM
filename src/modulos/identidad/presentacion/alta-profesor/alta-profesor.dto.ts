import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Formato de entrada de US02. Las reglas (RN-IDE-04, 06, 13) las valida el dominio. */
@ApiSchema({
  name: 'Dto.AltaProfesor',
  description: 'Datos para dar de alta a un profesor.',
})
export class AltaProfesorDto {
  @ApiProperty({
    description: 'Nombre del profesor.',
    example: 'Lucía',
    maxLength: 100,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Apellido del profesor.',
    example: 'Gómez',
    maxLength: 100,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @ApiProperty({
    description: 'Tipo de documento del profesor (RN-IDE-06).',
    example: 'DNI',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  tipoDocumento: string;

  @ApiProperty({
    description:
      'Número de documento del profesor. Único junto con el tipo de documento (RN-IDE-06).',
    example: '30123456',
    maxLength: 30,
  })
  @IsString()
  @MaxLength(30)
  numeroDocumento: string;

  @ApiProperty({
    description: 'Legajo del profesor. Único entre profesores (RN-IDE-04).',
    example: 'P-004',
    maxLength: 30,
  })
  @IsString()
  @MaxLength(30)
  legajo: string;

  @ApiProperty({
    description:
      'Email del profesor. Identificador de ingreso, único entre todos los usuarios (RN-IDE-13).',
    example: 'lucia.gomez@cwgym.com',
    maxLength: 254,
  })
  @IsString()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description:
      'Contraseña inicial del profesor. Debe tener al menos 8 caracteres. Se guarda hasheada.',
    example: 'Profesor#2026',
    maxLength: 200,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  contrasenia: string;
}
