import { IsUUID } from 'class-validator';

export class AlumnoDelPlanDto {
  @IsUUID()
  alumnoId: string;
}
