import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

@ApiSchema({
  name: 'Dto.Vinculo',
  description: 'Código de Profesor que ingresa el alumno para vincularse.',
})
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
