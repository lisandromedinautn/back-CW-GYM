import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

/** US22: cuerpo de PUT /planificacion/planes/:id/dias/:numero. `rutinaId` null deja el día de descanso. */
export class EditarDiaPlanDto {
  @ApiProperty({
    description:
      'Id de la rutina propia del profesor que pasa a ser el día. Null deja el día de descanso (RN-PLAN-10). Solo se cambian días de un plan Próximo o Vigente, que no sean anteriores a hoy ni el de hoy con Entrenamiento iniciado (RN-PLAN-23).',
    example: '9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a',
    type: 'string',
    format: 'uuid',
    nullable: true,
  })
  @ValidateIf((datos: EditarDiaPlanDto) => datos.rutinaId !== null)
  @IsUUID()
  rutinaId: string | null;
}
