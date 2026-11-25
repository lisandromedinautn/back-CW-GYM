import { CerrarEntrenamientoConRecords } from '../../aplicacion/finalizar-entrenamiento/cerrar-entrenamiento-con-records.caso-uso.js';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ErrorRespuesta } from '../../../../compartido/presentacion/error-respuesta/error-respuesta.js';
import {
  ESQUEMA_JWT,
  TAGS,
} from '../../../../compartido/presentacion/swagger/configurar-swagger.js';
import { RecordPersonalEntidadDoc } from '../entidades/entrenamiento.entidades.js';
import { ConsultarEntrenamientosDeAlumnos } from '../../aplicacion/consultar-entrenamientos-de-alumnos/consultar-entrenamientos-de-alumnos.caso-uso.js';
import { ConsultarEntrenamientoEnCurso } from '../../aplicacion/consultar-entrenamiento-en-curso/consultar-entrenamiento-en-curso.caso-uso.js';
import { IniciarEntrenamiento } from '../../aplicacion/iniciar-entrenamiento/iniciar-entrenamiento.caso-uso.js';
import { RegistrarPercepcion } from '../../aplicacion/registrar-percepcion/registrar-percepcion.caso-uso.js';
import { RegistrarPercepcionDto } from '../registrar-percepcion/registrar-percepcion.dto.js';
import { RegistrarSerieRealizada } from '../../aplicacion/registrar-serie-realizada/registrar-serie-realizada.caso-uso.js';
import { RegistrarSerieRealizadaDto } from '../registrar-serie-realizada/registrar-serie-realizada.dto.js';
import {
  EntrenamientoEnCursoRespuesta,
  IniciarEntrenamientoRespuesta,
  PaginaEntrenamientosDeAlumnoRespuesta,
  PercepcionRegistradaRespuesta,
  ResumenFinalizacionRespuesta,
  SerieRegistradaRespuesta,
} from '../respuestas/entrenamiento.respuestas.js';

/**
 * Entrenamiento realizado por el alumno: inicio, registro de series, finalización y percepción
 * (US13 a US18). El alumno sale del JWT; nunca viaja en la ruta ni en el cuerpo.
 */
@ApiBearerAuth(ESQUEMA_JWT)
@ApiExtraModels(RecordPersonalEntidadDoc, PaginacionDto)
@Controller('entrenamiento')
export class EntrenamientoControlador {
  constructor(
    @Inject(IniciarEntrenamiento) private readonly iniciarEntrenamiento: IniciarEntrenamiento,
    @Inject(ConsultarEntrenamientoEnCurso)
    private readonly consultarEntrenamiento: ConsultarEntrenamientoEnCurso,
    @Inject(RegistrarSerieRealizada) private readonly registrarSerie: RegistrarSerieRealizada,

    @Inject(RegistrarPercepcion)
    private readonly registrarPercepcion: RegistrarPercepcion,

    @Inject(CerrarEntrenamientoConRecords)
    private readonly cerrarEntrenamiento: CerrarEntrenamientoConRecords,

    @Inject(ConsultarEntrenamientosDeAlumnos)
    private readonly consultarDeAlumnos: ConsultarEntrenamientosDeAlumnos,
  ) {}

  /**
   * Inicia el entrenamiento de la rutina de hoy del plan vigente del alumno (US13, RN-ENT-01 y RN-ENT-02).
   * Guarda una copia independiente de la rutina, el peso corporal actual y la hora de inicio.
   * Responde 409 con RN-ENT-01 si no hay plan vigente, si es día de descanso o si ya se inició hoy.
   */
  @Post('entrenamientos')
  @ApiTags(TAGS.entrenamientoAlumno)
  @Roles('Alumno')
  @ApiOperation({
    summary:
      'Iniciar el entrenamiento de hoy (Alumno, US13, RN-ENT-01, RN-ENT-02): copia la rutina del día y guarda el peso corporal y la hora de inicio',
  })
  @ApiCreatedResponse({
    description: 'Entrenamiento iniciado',
    type: IniciarEntrenamientoRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol Alumno', type: ErrorRespuesta })
  @ApiConflictResponse({
    description: 'RN-ENT-01: sin plan vigente, día de descanso o entrenamiento de hoy ya iniciado',
    type: ErrorRespuesta,
  })
  iniciar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.iniciarEntrenamiento.ejecutar(usuario.sub);
  }

  /**
   * Devuelve el último entrenamiento del alumno (US13, RN-ENT-20). El estado sale de la fecha de consulta:
   * `en-curso`, `abandonado`, `finalizado` (con `fin`, `resumen` y `percepcion`) o `sin-entrenamiento`
   * (sin `entrenamiento`).
   */
  @Get('mi-entrenamiento-en-curso')
  @ApiTags(TAGS.entrenamientoAlumno)
  @Roles('Alumno')
  @ApiOperation({
    summary:
      'Consultar el entrenamiento en curso del alumno (Alumno, US13, RN-ENT-20): estado en-curso, abandonado, finalizado o sin-entrenamiento',
  })
  @ApiOkResponse({
    description:
      'Estado del último entrenamiento. Si no hay entrenamiento, responde estado sin-entrenamiento sin el campo entrenamiento',
    type: EntrenamientoEnCursoRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol Alumno', type: ErrorRespuesta })
  consultar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.consultarEntrenamiento.ejecutar(usuario.sub);
  }

  /**
   * Registra una serie realizada dentro de un entrenamiento iniciado y no finalizado (US14, RN-ENT-03,
   * RN-ENT-04, RN-ENT-19, RN-ENT-20). Registrar otra vez la misma serie la reemplaza.
   * Responde 400 con RN-ENT-03 si la referencia no existe o la medida es inválida, 404 si el
   * entrenamiento no es del alumno, y 409 con RN-ENT-04 o RN-ENT-20 si está finalizado o abandonado.
   */
  @Post('entrenamientos/:id/series')
  @ApiTags(TAGS.entrenamientoAlumno)
  @Roles('Alumno')
  @ApiOperation({
    summary:
      'Registrar una serie realizada (Alumno, US14, RN-ENT-03, RN-ENT-04, RN-ENT-19, RN-ENT-20): reemplaza la serie si se vuelve a registrar',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identificador del entrenamiento iniciado por el alumno',
  })
  @ApiCreatedResponse({
    description: 'Serie registrada',
    type: SerieRegistradaRespuesta,
  })
  @ApiBadRequestResponse({
    description: 'RN-ENT-03: referencia de serie inexistente o medida inválida',
    type: ErrorRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol Alumno', type: ErrorRespuesta })
  @ApiNotFoundResponse({
    description: 'RN-ENT-19: el entrenamiento no existe o es de otro alumno',
    type: ErrorRespuesta,
  })
  @ApiConflictResponse({
    description: 'RN-ENT-04 o RN-ENT-20: el entrenamiento está finalizado o abandonado',
    type: ErrorRespuesta,
  })
  registrar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarSerieRealizadaDto,
  ) {
    return this.registrarSerie.ejecutar(usuario.sub, id, dto);
  }

  /**
   * Finaliza un entrenamiento iniciado (US15, RN-ENT-05, RN-ENT-06, RN-ENT-09, RN-ENT-17, RN-ENT-21).
   * Registra la hora de fin, calcula el resumen, detecta los récords batidos (US16, RN-ENT-13) y
   * publica EntrenamientoFinalizado con las series por debajo de lo prescripto (US21).
   * Responde 404 si el entrenamiento no es del alumno y 409 con RN-ENT-05 si ya estaba finalizado o
   * con RN-ENT-20 si quedó abandonado.
   */
  @Post('entrenamientos/:id/finalizacion')
  @ApiTags(TAGS.entrenamientoAlumno)
  @Roles('Alumno')
  @ApiOperation({
    summary:
      'Finalizar el entrenamiento (Alumno, US15, US16, US21, RN-ENT-05, RN-ENT-13, RN-ENT-19, RN-ENT-20, RN-ENT-21): devuelve el resumen y los récords batidos',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identificador del entrenamiento iniciado por el alumno',
  })
  @ApiCreatedResponse({
    description:
      'Resumen del entrenamiento finalizado, con los récords batidos (recordsBatidos se omite si no hubo)',
    type: ResumenFinalizacionRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol Alumno', type: ErrorRespuesta })
  @ApiNotFoundResponse({
    description: 'RN-ENT-19: el entrenamiento no existe o es de otro alumno',
    type: ErrorRespuesta,
  })
  @ApiConflictResponse({
    description: 'RN-ENT-05: ya estaba finalizado. RN-ENT-20: quedó abandonado',
    type: ErrorRespuesta,
  })
  finalizar(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.cerrarEntrenamiento.ejecutar(usuario.sub, id);
  }

  /**
   * Carga la percepción del alumno (RPE y sensación de fuerza) una sola vez y los dos juntos, solo en un
   * entrenamiento finalizado (US17, RN-ENT-14, RN-ENT-15, RN-ENT-16, RN-ENT-19).
   * Responde 400 con RN-ENT-14 o RN-ENT-15 si un valor está fuera de rango, 404 si el entrenamiento no es
   * del alumno y 409 con RN-ENT-16 si no está finalizado o la percepción ya fue cargada.
   */
  @Post('entrenamientos/:id/percepcion')
  @ApiTags(TAGS.entrenamientoAlumno)
  @Roles('Alumno')
  @ApiOperation({
    summary:
      'Cargar la percepción del entrenamiento (Alumno, US17, RN-ENT-14, RN-ENT-15, RN-ENT-16, RN-ENT-19): RPE y sensación de fuerza, una sola vez y solo finalizado',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identificador del entrenamiento finalizado del alumno',
  })
  @ApiCreatedResponse({
    description: 'Percepción registrada',
    type: PercepcionRegistradaRespuesta,
  })
  @ApiBadRequestResponse({
    description: 'RN-ENT-14: RPE fuera de 1 a 10. RN-ENT-15: sensación de fuerza fuera de 1 a 5',
    type: ErrorRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol Alumno', type: ErrorRespuesta })
  @ApiNotFoundResponse({
    description: 'RN-ENT-19: el entrenamiento no existe o es de otro alumno',
    type: ErrorRespuesta,
  })
  @ApiConflictResponse({
    description:
      'RN-ENT-16: el entrenamiento no está finalizado (en curso o abandonado) o la percepción ya fue cargada',
    type: ErrorRespuesta,
  })
  cargarPercepcion(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarPercepcionDto,
  ) {
    return this.registrarPercepcion.ejecutar(usuario.sub, id, dto.rpe, dto.sensacionFuerza);
  }

  /**
   * Lista los entrenamientos de un alumno vinculado al profesor, del más nuevo al más viejo (US18,
   * RN-ENT-18). Paginado; cada ítem incluye su estado y su percepción (null si no se cargó).
   * Responde 403 con RN-ENT-18 si el alumno no es del profesor o no existe.
   */
  @Get('alumnos/:alumnoId/entrenamientos')
  @ApiTags(TAGS.entrenamientoProfesor)
  @Roles('Profesor')
  @ApiOperation({
    summary:
      'Listar los entrenamientos de un alumno (Profesor, US18, RN-ENT-18): solo de sus alumnos, paginado',
  })
  @ApiParam({
    name: 'alumnoId',
    format: 'uuid',
    description: 'Identificador del alumno vinculado al profesor',
  })
  @ApiOkResponse({
    description: 'Página de entrenamientos del alumno',
    type: PaginaEntrenamientosDeAlumnoRespuesta,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido', type: ErrorRespuesta })
  @ApiForbiddenResponse({
    description:
      'Usuario sin rol Profesor, o alumno ajeno o inexistente (RN-ENT-18, la misma respuesta en ambos casos)',
    type: ErrorRespuesta,
  })
  consultarDeAlumno(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('alumnoId', ParseUUIDPipe) alumnoId: string,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.consultarDeAlumnos.ejecutar(usuario.sub, alumnoId, paginacion);
  }
}
