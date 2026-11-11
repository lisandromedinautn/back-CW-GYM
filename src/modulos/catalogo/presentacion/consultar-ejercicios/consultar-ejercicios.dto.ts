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
export class ConsultarEjerciciosDto extends PaginacionDto {
  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @IsIn(GRUPOS_MUSCULARES)
  grupo?: string;

  @IsOptional()
  @IsIn(NOMBRES_MUSCULOS)
  musculo?: string;

  @IsOptional()
  @IsIn(TIPOS)
  tipo?: string;

  @IsOptional()
  @IsIn(TIPOS_CARGA)
  tipoCarga?: string;
}
