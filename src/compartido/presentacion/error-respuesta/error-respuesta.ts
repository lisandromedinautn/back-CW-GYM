import { ApiProperty, ApiSchema } from '@nestjs/swagger';

/**
 * Cuerpo de error que devuelve FiltroErrorDominio cuando el dominio rechaza una operación
 * (contrato con el front, src/compartido/CLAUDE.md). Solo documenta Swagger.
 */
@ApiSchema({
  name: 'Respuesta.Error',
  description: 'Error de dominio: código de la regla y mensaje.',
})
export class ErrorRespuesta {
  @ApiProperty({
    description: 'Código de la regla de negocio que se violó.',
    example: 'RN-PLAN-09',
  })
  codigo: string;

  @ApiProperty({
    description: 'Mensaje legible para mostrar al usuario.',
    example: 'El plan debe tener exactamente 28 días.',
  })
  mensaje: string;
}
