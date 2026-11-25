import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { TAMANIOS_PAGINA } from '../../dominio/paginacion/paginacion.js';

/**
 * T06: parámetros de paginación de la query. Sin código RN: un valor inválido responde 400.
 * El tamaño por defecto lo pone cada endpoint.
 */
export class PaginacionDto {
  @ApiPropertyOptional({ description: 'Número de página; arranca en 1.', minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página. Si se omite, la define cada endpoint.',
    enum: TAMANIOS_PAGINA,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(TAMANIOS_PAGINA)
  tamanio?: number;
}
