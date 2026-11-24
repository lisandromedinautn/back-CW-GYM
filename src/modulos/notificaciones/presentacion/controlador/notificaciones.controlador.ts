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
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import { ConsultarNotificaciones } from '../../aplicacion/consultar-notificaciones/consultar-notificaciones.caso-uso.js';
import { ContarNoLeidas } from '../../aplicacion/contar-no-leidas/contar-no-leidas.caso-uso.js';
import { MarcarNotificacionLeida } from '../../aplicacion/marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.js';

@Controller('notificaciones')
@Roles('Profesor')
export class NotificacionesControlador {
  constructor(
    @Inject(ConsultarNotificaciones) private readonly consultar: ConsultarNotificaciones,
    @Inject(ContarNoLeidas) private readonly contar: ContarNoLeidas,
    @Inject(MarcarNotificacionLeida) private readonly marcar: MarcarNotificacionLeida,
  ) {}

  @Get('mis-notificaciones')
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
  noLeidas(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.contar.ejecutar(usuario.sub);
  }

  @Put('mis-notificaciones/:id/lectura')
  @HttpCode(204)
  async marcarLeida(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.marcar.ejecutar(usuario.sub, id);
  }
}
