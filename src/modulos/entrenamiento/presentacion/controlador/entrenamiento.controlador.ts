import { CerrarEntrenamientoConRecords } from '../../aplicacion/finalizar-entrenamiento/cerrar-entrenamiento-con-records.caso-uso.js';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ConsultarEntrenamientosDeAlumnos } from '../../aplicacion/consultar-entrenamientos-de-alumnos/consultar-entrenamientos-de-alumnos.caso-uso.js';
import { ConsultarEntrenamientoEnCurso } from '../../aplicacion/consultar-entrenamiento-en-curso/consultar-entrenamiento-en-curso.caso-uso.js';
import { IniciarEntrenamiento } from '../../aplicacion/iniciar-entrenamiento/iniciar-entrenamiento.caso-uso.js';
import { RegistrarSerieRealizada } from '../../aplicacion/registrar-serie-realizada/registrar-serie-realizada.caso-uso.js';
import { RegistrarSerieRealizadaDto } from '../registrar-serie-realizada/registrar-serie-realizada.dto.js';

@Controller('entrenamiento')
export class EntrenamientoControlador {
  constructor(
    @Inject(IniciarEntrenamiento) private readonly iniciarEntrenamiento: IniciarEntrenamiento,
    @Inject(ConsultarEntrenamientoEnCurso)
    private readonly consultarEntrenamiento: ConsultarEntrenamientoEnCurso,
    @Inject(RegistrarSerieRealizada) private readonly registrarSerie: RegistrarSerieRealizada,
    @Inject(CerrarEntrenamientoConRecords)
    private readonly cerrarEntrenamiento: CerrarEntrenamientoConRecords,
    @Inject(ConsultarEntrenamientosDeAlumnos)
    private readonly consultarDeAlumnos: ConsultarEntrenamientosDeAlumnos,
  ) {}

  @Post('entrenamientos')
  @Roles('Alumno')
  iniciar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.iniciarEntrenamiento.ejecutar(usuario.sub);
  }

  @Get('mi-entrenamiento-en-curso')
  @Roles('Alumno')
  consultar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.consultarEntrenamiento.ejecutar(usuario.sub);
  }

  @Post('entrenamientos/:id/series')
  @Roles('Alumno')
  registrar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarSerieRealizadaDto,
  ) {
    return this.registrarSerie.ejecutar(usuario.sub, id, dto);
  }

  @Post('entrenamientos/:id/finalizacion')
  @Roles('Alumno')
  finalizar(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.cerrarEntrenamiento.ejecutar(usuario.sub, id);
  }

  @Get('alumnos/:alumnoId/entrenamientos')
  @Roles('Profesor')
  consultarDeAlumno(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('alumnoId', ParseUUIDPipe) alumnoId: string,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.consultarDeAlumnos.ejecutar(usuario.sub, alumnoId, paginacion);
  }
}
