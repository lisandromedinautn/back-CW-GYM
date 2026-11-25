import { ApiProperty, ApiSchema } from '@nestjs/swagger';

/** Roles que puede tener un usuario (RN-IDE-02). */
const ROLES = ['Admin', 'Profesor', 'Alumno'];

/** Respuesta de POST /identidad/ingreso (RN-IDE-01). */
@ApiSchema({
  name: 'Respuesta.Ingreso',
  description: 'Respuesta del ingreso: JWT y rol del usuario.',
})
export class IngresoRespuesta {
  @ApiProperty({
    description:
      'JWT firmado que identifica al usuario y lleva su rol. Se envía como Bearer en los siguientes requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZjJiIn0.k3...',
  })
  token: string;

  @ApiProperty({
    description: 'Rol del usuario que ingresó (RN-IDE-02: exactamente uno).',
    enum: ROLES,
    example: 'Profesor',
  })
  rol: string;
}

/** Respuesta de POST /identidad/profesores (RN-IDE-04). */
@ApiSchema({
  name: 'Respuesta.AltaProfesor',
  description: 'Profesor dado de alta: identificador y legajo.',
})
export class AltaProfesorRespuesta {
  @ApiProperty({
    description: 'Identificador del profesor dado de alta.',
    format: 'uuid',
    example: '3b9d6f1e-2a4c-4e8b-9f10-7c5a2d8e4b61',
  })
  id: string;

  @ApiProperty({
    description: 'Legajo del profesor. Es único entre todos los profesores (RN-IDE-04).',
    example: 'P-004',
  })
  legajo: string;
}

/** Respuesta de POST /identidad/profesores/codigo (RN-IDE-08). */
@ApiSchema({
  name: 'Respuesta.CodigoProfesor',
  description: 'Código de Profesor recién generado.',
})
export class CodigoProfesorRespuesta {
  @ApiProperty({
    description:
      'Código de Profesor recién generado. Reemplaza al anterior, que queda invalidado (RN-IDE-08).',
    example: 'K7QM2X',
  })
  codigo: string;
}

/** Respuesta de GET /identidad/profesores/codigo (RN-IDE-08). */
@ApiSchema({
  name: 'Respuesta.CodigoProfesorActual',
  description: 'Código de Profesor vigente, o null si todavía no hay ninguno.',
})
export class CodigoProfesorActualRespuesta {
  @ApiProperty({
    description:
      'Código de Profesor vigente, o null si el profesor todavía no generó ninguno (RN-IDE-08).',
    example: 'K7QM2X',
    type: String,
    nullable: true,
  })
  codigo: string | null;
}

/** Elemento de la respuesta de GET /identidad/alumnos (RN-PLAN-13, US07). */
@ApiSchema({
  name: 'Respuesta.AlumnoDelProfesor',
  description: 'Alumno vinculado al profesor.',
})
export class AlumnoDelProfesorRespuesta {
  @ApiProperty({
    description: 'Identificador del alumno vinculado al profesor.',
    format: 'uuid',
    example: '9c1e4b7a-5d2f-4a3e-8b6c-1f0e9d2a7c35',
  })
  id: string;

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
}

/** Datos del profesor que se devuelven al alumno al vincularse (RN-IDE-09). */
@ApiSchema({
  name: 'Respuesta.ProfesorVinculado',
  description: 'Profesor con el que quedó vinculado el alumno.',
})
export class ProfesorVinculadoRespuesta {
  @ApiProperty({
    description: 'Nombre del profesor con el que quedó vinculado el alumno.',
    example: 'Martín',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del profesor con el que quedó vinculado el alumno.',
    example: 'Gómez',
  })
  apellido: string;
}

/** Respuesta de POST /identidad/alumnos/vinculo (RN-IDE-09, 10, 11). */
@ApiSchema({
  name: 'Respuesta.Vinculo',
  description: 'Resultado del vínculo entre alumno y profesor.',
})
export class VinculoRespuesta {
  @ApiProperty({
    description:
      'Profesor al que quedó vinculado el alumno. Un alumno solo puede tener un profesor (RN-IDE-10).',
    type: () => ProfesorVinculadoRespuesta,
  })
  profesor: ProfesorVinculadoRespuesta;
}
