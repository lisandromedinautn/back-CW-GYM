import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ESQUEMA_JWT } from '../../../../compartido/presentacion/swagger/configurar-swagger.js';
import { ErrorRespuesta } from '../../../../compartido/presentacion/error-respuesta/error-respuesta.js';
import { Roles } from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ConsultarEjercicios } from '../../aplicacion/consultar-ejercicios/consultar-ejercicios.caso-uso.js';
import { ListarEjercicios } from '../../aplicacion/listar-ejercicios/listar-ejercicios.caso-uso.js';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
import { ConsultarEjerciciosDto } from '../consultar-ejercicios/consultar-ejercicios.dto.js';
import {
  EjercicioRespuesta,
  PaginaEjerciciosRespuesta,
} from '../respuestas/catalogo.respuestas.js';

const aRespuesta = (ejercicio: Ejercicio): EjercicioRespuesta => ({
  id: ejercicio.id,
  nombre: ejercicio.nombre,
  descripcion: ejercicio.descripcion,
  tipo: ejercicio.tipo.valor,
  tipoCarga: ejercicio.tipoCarga.valor,
  factorPesoCorporal: ejercicio.factorPesoCorporal?.porcentaje ?? null,
  musculoPrincipal: ejercicio.musculoPrincipal.nombre,
  grupoMuscular: ejercicio.musculoPrincipal.grupo,
  musculoSecundario: ejercicio.musculoSecundario?.nombre ?? null,
  urlGif: ejercicio.urlGif,
  atribucion: ejercicio.atribucion,
});

/** Consulta del catálogo de ejercicios (RN-CAT-01 a 09). */
@ApiTags('Catálogo')
@Controller('catalogo')
export class CatalogoControlador {
  constructor(
    @Inject(ListarEjercicios) private readonly listar: ListarEjercicios,
    @Inject(ConsultarEjercicios) private readonly consultar: ConsultarEjercicios,
  ) {}

  /** Admin y Profesor (RN-IDE-03). Lo usan la lista de ejercicios y, en US06, el editor de rutinas. */
  @Get('ejercicios')
  @Roles('Admin', 'Profesor')
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiOperation({
    summary: 'Listar todos los ejercicios del catálogo (rol Admin o Profesor; RN-IDE-03)',
    description: 'Sin paginar. Lo usa el editor de rutinas (US06).',
  })
  @ApiOkResponse({ type: [EjercicioRespuesta] })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async ejercicios(): Promise<EjercicioRespuesta[]> {
    return (await this.listar.ejecutar()).map(aRespuesta);
  }

  /** Admin y Profesor (RN-IDE-03). T06 y T07: consulta paginada con buscador y filtros; tamaño por defecto 20. */
  @Get('ejercicios/consulta')
  @Roles('Admin', 'Profesor')
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiOperation({
    summary:
      'Consultar ejercicios paginados con buscador y filtros (rol Admin o Profesor; RN-IDE-03, T06 y T07)',
    description:
      'Ordenado por nombre ascendente. Tamaño por defecto 20. Filtros combinados con Y (RN-UI-LIS-01 y 02).',
  })
  @ApiOkResponse({ type: PaginaEjerciciosRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async consulta(@Query() consulta: ConsultarEjerciciosDto): Promise<PaginaEjerciciosRespuesta> {
    const { busqueda, grupo, musculo, tipo, tipoCarga, pagina, tamanio } = consulta;
    const resultado = await this.consultar.ejecutar(
      { busqueda, grupoMuscular: grupo, musculo, tipo, tipoCarga },
      pagina ?? 1,
      tamanio ?? 20,
    );
    return { ...resultado, items: resultado.items.map(aRespuesta) };
  }
}
