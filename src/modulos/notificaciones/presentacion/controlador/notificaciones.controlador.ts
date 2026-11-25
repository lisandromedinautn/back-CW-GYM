import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import { ESQUEMA_JWT } from '../../../../compartido/presentacion/swagger/configurar-swagger.js';
import { ErrorRespuesta } from '../../../../compartido/presentacion/error-respuesta/error-respuesta.js';
import { ConsultarNotificaciones } from '../../aplicacion/consultar-notificaciones/consultar-notificaciones.caso-uso.js';
import { ContarNoLeidas } from '../../aplicacion/contar-no-leidas/contar-no-leidas.caso-uso.js';
import { MarcarNotificacionLeida } from '../../aplicacion/marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.js';
import {
  NoLeidasRespuesta,
  PaginaNotificacionesRespuesta,
} from '../respuestas/notificaciones.respuestas.js';

/**
 * Bandeja de notificaciones del profesor (US21, RN-NOT-03 a RN-NOT-04).
 * Cada notificación avisa de un Entrenamiento de un alumno suyo por debajo de lo prescripto.
 */
@ApiExtraModels(PaginacionDto)
@ApiTags('Notificaciones')
@ApiBearerAuth(ESQUEMA_JWT)
@Controller('notificaciones')
@Roles('Profesor')
export class NotificacionesControlador {
  constructor(
    @Inject(ConsultarNotificaciones) private readonly consultar: ConsultarNotificaciones,
    @Inject(ContarNoLeidas) private readonly contar: ContarNoLeidas,
    @Inject(MarcarNotificacionLeida) private readonly marcar: MarcarNotificacionLeida,
  ) {}

  @Get('mis-notificaciones')
  @ApiOperation({
    summary:
      'Profesor: lista sus notificaciones paginadas, de la más nueva a la más vieja, con la cantidad de no leídas (RN-NOT-03)',
  })
  @ApiOkResponse({ type: PaginaNotificacionesRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async misNotificaciones(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query() paginacion: PaginacionDto,
  ) {
    const bandeja = await this.consultar.ejecutar(usuario.sub, paginacion);
    return {
      items: bandeja.items.map((n) => ({
        id: n.id,
        tipo: n.tipo,
        creada: n.creada,
        leida: n.leida,
        gravedad: n.gravedad,
        alumno: n.alumno,
        entrenamiento: n.entrenamiento,
        totalSeries: n.totalSeries,
        seriesPorDebajo: n.seriesPorDebajo,
        percepcion: n.percepcion,
        ...(n.entrenamientos ? { entrenamientos: n.entrenamientos } : {}),
      })),
      total: bandeja.total,
      pagina: bandeja.pagina,
      tamanio: bandeja.tamanio,
      noLeidas: bandeja.noLeidas,
    };
  }

  @Get('mis-notificaciones/no-leidas')
  @ApiOperation({
    summary: 'Profesor: devuelve la cantidad de sus notificaciones no leídas (RN-NOT-03)',
  })
  @ApiOkResponse({ type: NoLeidasRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  noLeidas(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.contar.ejecutar(usuario.sub);
  }

  @Put('mis-notificaciones/:id/lectura')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Profesor: marca una notificación propia como leída; repetirlo no cambia nada. Ajena o inexistente responde 404 (RN-NOT-04)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Notificación marcada como leída' })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async marcarLeida(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.marcar.ejecutar(usuario.sub, id);
  }
}
