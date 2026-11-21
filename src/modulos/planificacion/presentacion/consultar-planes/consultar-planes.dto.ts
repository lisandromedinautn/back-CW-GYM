import { IsIn, IsISO8601, IsOptional, IsUUID, Matches } from 'class-validator';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * T13: query de GET /planificacion/planes. RN-PLAN-22: filtros por estado, alumno y rango de
 * inicio. Un valor inválido responde 400 sin código RN.
 */
export class ConsultarPlanesDto extends PaginacionDto {
  @IsOptional()
  @IsIn(['proximo', 'vigente', 'finalizado'])
  estado?: 'proximo' | 'vigente' | 'finalizado';

  @IsOptional()
  @IsUUID()
  alumnoId?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA)
  @IsISO8601({ strict: true })
  inicioDesde?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA)
  @IsISO8601({ strict: true })
  inicioHasta?: string;
}
