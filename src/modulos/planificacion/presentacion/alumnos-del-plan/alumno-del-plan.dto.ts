import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AlumnoDelPlanDto {
  @ApiProperty({
    description:
      'Id del alumno vinculado al profesor que se asigna al plan vigente (RN-PLAN-13, RN-PLAN-14).',
    example: '3f2b9c1e-7a4d-4e8b-9c2f-1d5a6b7c8e90',
    format: 'uuid',
  })
  @IsUUID()
  alumnoId: string;
}
