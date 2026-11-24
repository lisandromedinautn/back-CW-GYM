import { IsUUID, ValidateIf } from 'class-validator';

/** US22: cuerpo de PUT /planificacion/planes/:id/dias/:numero. `rutinaId` null deja el día de descanso. */
export class EditarDiaPlanDto {
  @ValidateIf((datos: EditarDiaPlanDto) => datos.rutinaId !== null)
  @IsUUID()
  rutinaId: string | null;
}
