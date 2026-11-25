import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsUUID, Matches } from 'class-validator';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * T13: query de GET /planificacion/planes. RN-PLAN-22: filtros por estado, alumno y rango de
 * inicio. Un valor inválido responde 400 sin código RN.
 */
@ApiSchema({
  name: 'Dto.ConsultarPlanes',
  description:
    'Query del listado de planes con filtros por estado, alumno y rango de inicio (RN-PLAN-22).',
})
export class ConsultarPlanesDto extends PaginacionDto {
  @ApiPropertyOptional({
    description:
      'Filtra por estado según RN-PLAN-15: proximo (todavía no empezó), vigente (hoy está entre inicio y fin) o finalizado (pasó la fecha de fin).',
    enum: ['proximo', 'vigente', 'finalizado'],
    example: 'vigente',
  })
  @IsOptional()
  @IsIn(['proximo', 'vigente', 'finalizado'])
  estado?: 'proximo' | 'vigente' | 'finalizado';

  @ApiPropertyOptional({
    description: 'Solo planes a los que está asignado este alumno (RN-PLAN-22).',
    example: '3f2b9c1e-7a4d-4e8b-9c2f-1d5a6b7c8e90',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  alumnoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio mínima del plan, inclusive (AAAA-MM-DD, UTC).',
    example: '2026-11-01',
    format: 'date',
  })
  @IsOptional()
  @Matches(FORMATO_FECHA)
  @IsISO8601({ strict: true })
  inicioDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio máxima del plan, inclusive (AAAA-MM-DD, UTC).',
    example: '2026-11-30',
    format: 'date',
  })
  @IsOptional()
  @Matches(FORMATO_FECHA)
  @IsISO8601({ strict: true })
  inicioHasta?: string;
}
