import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import { GRUPOS_MUSCULARES, NOMBRES_MUSCULOS } from '../../dominio/musculo/musculo.valor.js';
import { TipoCarga } from '../../dominio/tipo-carga/tipo-carga.valor.js';
import { TipoEjercicio } from '../../dominio/tipo-ejercicio/tipo-ejercicio.valor.js';

const TIPOS = [TipoEjercicio.POR_TIEMPO.valor, TipoEjercicio.POR_REPETICIONES.valor];
const TIPOS_CARGA = [
  TipoCarga.SIN_PESO.valor,
  TipoCarga.PESO_CORPORAL.valor,
  TipoCarga.PESO_EXTRA.valor,
  TipoCarga.PESO_CORPORAL_Y_EXTRA.valor,
];

/**
 * T06 y T07: query de GET /catalogo/ejercicios/consulta. Grupo, músculo, tipo y tipo de carga
 * salen de las listas cerradas de RN-CAT-05, 02 y 03: otro valor responde 400.
 */
@ApiSchema({
  name: 'Dto.ConsultarEjercicios',
  description: 'Parámetros de query para consultar ejercicios paginados con buscador y filtros.',
})
export class ConsultarEjerciciosDto extends PaginacionDto {
  @ApiPropertyOptional({
    description: 'Texto contenido en el nombre del ejercicio, sin distinguir mayúsculas',
    example: 'press',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Grupo muscular de los ejercicios (RN-CAT-05)',
    enum: GRUPOS_MUSCULARES,
    example: 'Piernas',
    nullable: true,
  })
  @IsOptional()
  @IsIn(GRUPOS_MUSCULARES)
  grupo?: string;

  @ApiPropertyOptional({
    description: 'Músculo principal exacto del ejercicio (RN-CAT-05)',
    enum: NOMBRES_MUSCULOS,
    example: 'Cuádriceps',
    nullable: true,
  })
  @IsOptional()
  @IsIn(NOMBRES_MUSCULOS)
  musculo?: string;

  @ApiPropertyOptional({
    description: 'Tipo de ejercicio: por tiempo o por repeticiones (RN-CAT-02)',
    enum: TIPOS,
    example: 'por repeticiones',
    nullable: true,
  })
  @IsOptional()
  @IsIn(TIPOS)
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Tipo de carga del ejercicio (RN-CAT-03)',
    enum: TIPOS_CARGA,
    example: 'Peso Extra',
    nullable: true,
  })
  @IsOptional()
  @IsIn(TIPOS_CARGA)
  tipoCarga?: string;
}
