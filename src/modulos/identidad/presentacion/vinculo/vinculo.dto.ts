import { IsString, MaxLength } from 'class-validator';

export class VinculoDto {
  @IsString()
  @MaxLength(20)
  codigo: string;
}
