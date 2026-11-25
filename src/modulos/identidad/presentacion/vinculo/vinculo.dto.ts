import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class VinculoDto {
  @ApiProperty({
    description:
      'Código de Profesor entregado por el profesor. Si no existe o fue invalidado por regeneración, no vincula (RN-IDE-08, RN-IDE-11).',
    example: 'K7P2QX9M',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  codigo: string;
}
