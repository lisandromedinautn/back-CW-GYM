import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { TAMANIOS_PAGINA } from '../../dominio/paginacion/paginacion.js';

/**
 * T06: parámetros de paginación de la query. Sin código RN: un valor inválido responde 400.
 * El tamaño por defecto lo pone cada endpoint.
 */
export class PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(TAMANIOS_PAGINA)
  tamanio?: number;
}
