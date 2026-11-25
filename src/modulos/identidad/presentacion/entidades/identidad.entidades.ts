import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

/**
 * Documentación de Usuario (RN-IDE-01, 02, 13). Solo para Swagger: no valida nada.
 * La contraseña se guarda hasheada y nunca se expone.
 */
@ApiSchema({
  name: 'Entidad.Usuario',
  description:
    'Usuario del sistema con sus credenciales de ingreso. La contraseña se guarda hasheada y nunca se expone.',
})
export class UsuarioEntidadDoc {
  @ApiProperty({
    description: 'Identificador único del usuario.',
    format: 'uuid',
    example: '7f2b8c1d-4e3a-4b9f-8d2e-1a6c5b9e0f37',
  })
  id: string;

  @ApiProperty({
    description:
      'Email con el que ingresa al sistema. Es único entre todos los usuarios (RN-IDE-13).',
    example: 'alumno01@cwgym.com',
    maxLength: 254,
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario. Cada usuario tiene exactamente uno (RN-IDE-02).',
    enum: ['Admin', 'Profesor', 'Alumno'],
    example: 'Alumno',
  })
  rol: string;
}

/**
 * Documentación de Profesor (RN-IDE-04, 06, 08). Solo para Swagger: no valida nada.
 * El código de Profesor solo lo ve el propio profesor.
 */
@ApiSchema({
  name: 'Entidad.Profesor',
  description:
    'Profesor con sus datos personales, su legajo y su Código de Profesor vigente, si generó uno.',
})
export class ProfesorEntidadDoc {
  @ApiProperty({
    description: 'Identificador único del profesor.',
    format: 'uuid',
    example: '3b9d6f1e-2a4c-4e8b-9f10-7c5a2d8e4b61',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del usuario asociado, con el que ingresa al sistema.',
    format: 'uuid',
    example: 'c4a1e8f2-6b3d-4a7e-9c5f-2d8b1e0a6f74',
  })
  usuarioId: string;

  @ApiProperty({
    description: 'Nombre del profesor.',
    example: 'Martín',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del profesor.',
    example: 'Gómez',
  })
  apellido: string;

  @ApiProperty({
    description: 'Tipo de documento. Único junto con el número (RN-IDE-06).',
    enum: ['DNI', 'LC', 'LE', 'Pasaporte'],
    example: 'DNI',
  })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Número de documento. Único junto con el tipo (RN-IDE-06).',
    example: '30123456',
  })
  numeroDocumento: string;

  @ApiProperty({
    description: 'Legajo del profesor. Es único entre todos los profesores (RN-IDE-04).',
    example: 'P-004',
  })
  legajo: string;

  @ApiProperty({
    description:
      'Código de Profesor vigente, o null si todavía no generó ninguno. Generar uno nuevo invalida el anterior (RN-IDE-08).',
    example: 'K7QM2X',
    type: String,
    nullable: true,
  })
  codigo: string | null;
}

/**
 * Documentación de Alumno (RN-IDE-05, 06, 07, 09, 10). Solo para Swagger: no valida nada.
 * La contraseña se guarda hasheada y nunca se expone.
 */
@ApiSchema({
  name: 'Entidad.Alumno',
  description:
    'Alumno con datos personales, de salud y el profesor vinculado, si lo tiene. La contraseña se guarda hasheada y nunca se expone.',
})
export class AlumnoEntidadDoc {
  @ApiProperty({
    description: 'Identificador único del alumno.',
    format: 'uuid',
    example: '9c1e4b7a-5d2f-4a3e-8b6c-1f0e9d2a7c35',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del usuario asociado, con el que ingresa al sistema.',
    format: 'uuid',
    example: 'e7d3b9a1-2c8f-4d6e-a5b0-9f1c3e7d2a48',
  })
  usuarioId: string;

  @ApiProperty({
    description: 'Nombre del alumno.',
    example: 'Lucía',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del alumno.',
    example: 'Pérez Martín',
  })
  apellido: string;

  @ApiProperty({
    description: 'Domicilio del alumno (RN-IDE-05).',
    example: 'Av. Siempreviva 742',
  })
  domicilio: string;

  @ApiProperty({
    description: 'Tipo de documento. Único junto con el número (RN-IDE-06).',
    enum: ['DNI', 'LC', 'LE', 'Pasaporte'],
    example: 'DNI',
  })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Número de documento. Único junto con el tipo (RN-IDE-06).',
    example: '40987654',
  })
  numeroDocumento: string;

  @ApiProperty({
    description:
      'Datos de salud del alumno (RN-IDE-05). El peso no tiene historial: un cambio sobrescribe el anterior (RN-IDE-07).',
    type: 'object',
    properties: {
      alturaCm: { type: 'number', example: 168 },
      pesoKg: { type: 'number', example: 62.5 },
      edad: { type: 'integer', example: 27 },
    },
  })
  salud: { alturaCm: number; pesoKg: number; edad: number };

  @ApiPropertyOptional({
    description:
      'Identificador del profesor vinculado, o null mientras el alumno no se vincule. Un alumno solo puede tener un profesor (RN-IDE-09, RN-IDE-10).',
    format: 'uuid',
    type: String,
    nullable: true,
    example: '3b9d6f1e-2a4c-4e8b-9f10-7c5a2d8e4b61',
  })
  profesorId: string | null;
}
