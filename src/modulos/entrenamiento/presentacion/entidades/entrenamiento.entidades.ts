import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import type { TipoRecord } from '../../dominio/record-personal/tipo-record.js';

/**
 * Récord Personal (RN-ENT-13): la mejor marca de un alumno en un ejercicio y tipo (RN-ENT-10).
 * Solo documenta Swagger; no valida nada ni se usa en los DTO.
 */
@ApiSchema({
  name: 'Entidad.RecordPersonal',
  description: 'Mejor marca de un alumno en un ejercicio y tipo de récord.',
})
export class RecordPersonalEntidadDoc {
  @ApiProperty({
    description:
      'Identificador del récord. Se conserva cuando una marca nueva lo supera (RN-ENT-13).',
    example: '6c3e1f2a-9b8d-4c7e-a5f4-3d2c1b0a9e8f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del alumno dueño del récord.',
    example: '7a2f9c1e-4b3d-4e8a-9f6c-1d2e3f4a5b6c',
    format: 'uuid',
  })
  alumnoId: string;

  @ApiProperty({
    description: 'Identificador del ejercicio al que pertenece el récord.',
    example: '3f7c2b1e-8d4a-4e6b-9a1f-2c5d7e8f9a0b',
    format: 'uuid',
  })
  ejercicioId: string;

  @ApiProperty({
    description:
      'Tipo de récord (RN-ENT-10): repeticiones, volumen de serie, 1RM estimado (RN-ENT-11) o tiempo. Un alumno tiene un récord por ejercicio y tipo.',
    enum: ['repeticiones', 'volumen', '1rm', 'tiempo'] satisfies TipoRecord[],
    example: '1rm',
  })
  tipo: TipoRecord;

  @ApiProperty({
    description:
      'Marca vigente: repeticiones para el tipo `repeticiones`, kilogramos para `volumen` y `1rm`, y segundos para `tiempo` (RN-ENT-13).',
    example: 108,
  })
  valor: number;

  @ApiProperty({
    description:
      'Identificador del entrenamiento que dejó la marca vigente. Cambia cada vez que la marca es superada (RN-ENT-13).',
    example: '5e8a1c3d-2b7f-4d9e-8a6c-0f1b2d3e4a5b',
    format: 'uuid',
  })
  entrenamientoId: string;

  @ApiProperty({
    description: 'Fecha del entrenamiento que dejó la marca vigente, en ISO 8601.',
    example: '2026-11-25T15:10:00.000Z',
  })
  fecha: string;
}
