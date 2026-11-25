import { AlumnosDelPlan } from '../../aplicacion/alumnos-del-plan/alumnos-del-plan.caso-uso.js';
import { AlumnoDelPlanDto } from '../alumnos-del-plan/alumno-del-plan.dto.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ConsultarRutinas } from '../../aplicacion/consultar-rutinas/consultar-rutinas.caso-uso.js';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import {
  ESQUEMA_JWT,
  TAGS,
} from '../../../../compartido/presentacion/swagger/configurar-swagger.js';
import { ErrorRespuesta } from '../../../../compartido/presentacion/error-respuesta/error-respuesta.js';
import { RenombrarRutina } from '../../aplicacion/renombrar-rutina/renombrar-rutina.caso-uso.js';
import { CrearRutina } from '../../aplicacion/crear-rutina/crear-rutina.caso-uso.js';
import { EditarRutina } from '../../aplicacion/editar-rutina/editar-rutina.caso-uso.js';
import { ImportarRutina } from '../../aplicacion/importar-rutina/importar-rutina.caso-uso.js';
import { CrearPlan } from '../../aplicacion/crear-plan/crear-plan.caso-uso.js';
import {
  ConsultarRutinaDelDia,
  type ResultadoRutinaDelDia,
} from '../../aplicacion/consultar-rutina-del-dia/consultar-rutina-del-dia.caso-uso.js';
import {
  ConsultarPlanes,
  type DetallePlan,
  type ResumenPlan,
} from '../../aplicacion/consultar-planes/consultar-planes.caso-uso.js';
import {
  EditarDiaPlan,
  type DiaEditado,
} from '../../aplicacion/editar-dia-plan/editar-dia-plan.caso-uso.js';
import { EditarDiaPlanDto } from '../editar-dia-plan/editar-dia-plan.dto.js';
import { ConsultarPlanesDto } from '../consultar-planes/consultar-planes.dto.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import {
  ConsultarPlanDelAlumno,
  type ResultadoPlanDelAlumno,
} from '../../aplicacion/consultar-plan-del-alumno/consultar-plan-del-alumno.caso-uso.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { CrearPlanDto } from '../crear-plan/crear-plan.dto.js';
import { CrearRutinaDto, RenombrarRutinaDto } from '../crear-rutina/crear-rutina.dto.js';
import {
  PaginaRutinasRespuesta,
  RutinaDelDiaRespuesta,
  RutinaRespuesta,
} from '../respuestas/rutina.respuestas.js';
import {
  AlumnosDelPlanRespuesta,
  DetallePlanRespuesta,
  DiaEditadoRespuesta,
  PaginaPlanesRespuesta,
  PlanDelAlumnoRespuesta,
  PlanRespuesta,
} from '../respuestas/plan.respuestas.js';

const aRespuestaPlan = (plan: Plan): PlanRespuesta => ({
  id: plan.id,
  fechaInicio: plan.fechaInicio,
  fechaFin: plan.fechaFin,
  dias: plan.dias.map((dia) => ({
    numero: dia.numero,
    fecha: dia.fecha,
    rutinaId: dia.rutinaId,
    esDescanso: dia.esDescanso,
  })),
  alumnoIds: [...plan.alumnoIds],
});

const aRespuesta = (rutina: Rutina): RutinaRespuesta => ({
  id: rutina.id,
  nombre: rutina.nombre,
  tipo: rutina.tipo.valor,
  bloques: rutina.bloques.map((bloque) => ({
    orden: rutina.ordenDe(bloque),
    ejercicioId: bloque.ejercicio.ejercicioId,
    series: bloque.series,
    micropausaSegundos: bloque.micropausa.segundos,
    macropausaSegundos: bloque.macropausa.segundos,
    repeticiones: bloque.ejercicio.objetivo.repeticiones,
    segundos: bloque.ejercicio.objetivo.segundos,
    pesoKg: bloque.ejercicio.objetivo.pesoKg,
  })),
  circuitos: rutina.circuitos.map((circuito) => ({
    orden: rutina.ordenDe(circuito),
    vueltas: circuito.vueltas,
    macropausaSegundos: circuito.macropausa.segundos,
    ejercicios: circuito.ejercicios.map((ejercicio) => ({
      ejercicioId: ejercicio.ejercicioId,
      repeticiones: ejercicio.objetivo.repeticiones,
      segundos: ejercicio.objetivo.segundos,
      pesoKg: ejercicio.objetivo.pesoKg,
    })),
  })),
});

const PARAMETRO_ID_UUID = {
  name: 'id',
  description: 'Id del recurso (UUID).',
  schema: { type: 'string', format: 'uuid' },
} as const;

const PARAMETRO_NUMERO_DIA = {
  name: 'numero',
  description: 'Número del día dentro del plan (1..28).',
  schema: { type: 'integer', minimum: 1, maximum: 28 },
} as const;

@ApiExtraModels(ConsultarPlanesDto, PaginacionDto)
@ApiBearerAuth(ESQUEMA_JWT)
@Controller('planificacion')
export class PlanificacionControlador {
  constructor(
    @Inject(CrearRutina) private readonly crearRutina: CrearRutina,
    @Inject(EditarRutina) private readonly editarRutina: EditarRutina,
    @Inject(ImportarRutina) private readonly importarRutina: ImportarRutina,
    @Inject(ConsultarRutinas) private readonly consultarRutinas: ConsultarRutinas,
    @Inject(RenombrarRutina) private readonly renombrarRutina: RenombrarRutina,
    @Inject(CrearPlan) private readonly crearPlan: CrearPlan,
    @Inject(AlumnosDelPlan) private readonly alumnosDelPlan: AlumnosDelPlan,
    @Inject(EditarDiaPlan) private readonly editarDiaPlan: EditarDiaPlan,
    @Inject(ConsultarPlanes) private readonly consultarPlanes: ConsultarPlanes,
    @Inject(ConsultarRutinaDelDia)
    private readonly consultarRutinaDelDia: ConsultarRutinaDelDia,
    @Inject(ConsultarPlanDelAlumno)
    private readonly consultarPlanDelAlumno: ConsultarPlanDelAlumno,
  ) {}

  /** Solo Profesor (RN-IDE-03). T06: consulta paginada de sus propias rutinas (RN-PLAN-08). */
  @ApiTags(TAGS.planificacionRutinas)
  @Get('rutinas')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: lista paginada de sus rutinas (RN-PLAN-08)' })
  @ApiOkResponse({ type: PaginaRutinasRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async listar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query() paginacion: PaginacionDto,
  ): Promise<PaginaRutinasRespuesta> {
    const resultado = await this.consultarRutinas.ejecutar(
      usuario.sub,
      paginacion.pagina,
      paginacion.tamanio,
    );
    return { ...resultado, items: resultado.items.map(aRespuesta) };
  }

  /** Solo Profesor (RN-IDE-03). US06: RN-PLAN-01, 02, 04, 05, 06. US09: RN-PLAN-03, 20. US10: RN-PLAN-01. */
  @ApiTags(TAGS.planificacionRutinas)
  @Post('rutinas')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: crea una rutina de bloques, circuitos o mixta (US06, US09, US10)',
  })
  @ApiCreatedResponse({ type: RutinaRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: CrearRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.crearRutina.ejecutar(usuario.sub, datos));
  }

  /** Solo Profesor (RN-IDE-03). US06: detalle de una rutina propia (RN-PLAN-08). */
  @ApiTags(TAGS.planificacionRutinas)
  @Get('rutinas/:id')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: detalle de una rutina propia (US06, RN-PLAN-08)' })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiOkResponse({ type: RutinaRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async detalle(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.consultarRutinas.porId(usuario.sub, id));
  }

  /** Solo Profesor (RN-IDE-03). US06: RN-PLAN-07 y 08; el contenido sigue las reglas de crear. */
  @ApiTags(TAGS.planificacionRutinas)
  @Put('rutinas/:id')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: edita el contenido de una rutina propia (US06, RN-PLAN-07, 08)',
  })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiOkResponse({ type: RutinaRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async editar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: CrearRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.editarRutina.ejecutar(usuario.sub, id, datos));
  }

  /** Solo Profesor (RN-IDE-03). T08: RN-PLAN-21 (nombre) y RN-PLAN-08 (solo sus rutinas). */
  @ApiTags(TAGS.planificacionRutinas)
  @Patch('rutinas/:id/nombre')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: renombra una rutina propia (RN-PLAN-21, 08)' })
  @ApiParam({ ...PARAMETRO_ID_UUID })
  @ApiOkResponse({ type: RutinaRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  @ApiConflictResponse({ type: ErrorRespuesta })
  async renombrar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() datos: RenombrarRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.renombrarRutina.ejecutar(usuario.sub, id, datos.nombre));
  }

  /** RN-PLAN-08: copia independiente de una rutina propia. */
  @ApiTags(TAGS.planificacionRutinas)
  @Post('rutinas/:id/importacion')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: importa una copia independiente de una rutina propia (US20, RN-PLAN-08)',
  })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiCreatedResponse({ type: RutinaRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async importar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.importarRutina.ejecutar(usuario.sub, id));
  }

  /** Solo Profesor (RN-IDE-03). US07: RN-PLAN-09 a 15 y 17. */
  @ApiTags(TAGS.planificacionPlanes)
  @Post('planes')
  @Roles('Profesor')
  @ApiOperation({
    summary:
      'Profesor: crea un Plan de Entrenamiento de 28 días con alumnos (US07, RN-PLAN-09 a 15, 17)',
  })
  @ApiCreatedResponse({ type: PlanRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  @ApiConflictResponse({ type: ErrorRespuesta })
  async crearPlanDeEntrenamiento(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: CrearPlanDto,
  ): Promise<PlanRespuesta> {
    const plan = await this.crearPlan.ejecutar(usuario.sub, {
      fechaInicio: datos.fechaInicio,
      dias: datos.dias.map((dia) => ({ numero: dia.numero, rutinaId: dia.rutinaId ?? null })),
      alumnos: datos.alumnos,
    });
    return aRespuestaPlan(plan);
  }

  /** Solo Profesor (RN-IDE-03). T13: RN-PLAN-22 (sus planes, filtros, orden) y RN-PLAN-15 (estado). */
  @ApiTags(TAGS.planificacionPlanes)
  @Get('planes')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: lista paginada y filtrada de sus planes con estado (RN-PLAN-22, 15)',
  })
  @ApiOkResponse({ type: PaginaPlanesRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async listarPlanes(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query() consulta: ConsultarPlanesDto,
  ): Promise<{ items: ResumenPlan[]; total: number; pagina: number; tamanio: number }> {
    return this.consultarPlanes.ejecutar(usuario.sub, consulta);
  }

  /** Solo Profesor (RN-IDE-03). US22: detalle de un plan propio con sus 28 días. */
  @ApiTags(TAGS.planificacionPlanes)
  @Get('planes/:id')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: detalle de un plan propio con sus 28 días (US22)' })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiOkResponse({ type: DetallePlanRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async detallePlan(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DetallePlan> {
    return this.consultarPlanes.porId(usuario.sub, id);
  }

  /** Solo Profesor (RN-IDE-03). US22: RN-PLAN-23 (editar un día) y RN-PLAN-11. */
  @ApiTags(TAGS.planificacionPlanes)
  @Put('planes/:id/dias/:numero')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: cambia la rutina de un día o lo pasa a descanso (US22, RN-PLAN-23, 11)',
  })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiParam(PARAMETRO_NUMERO_DIA)
  @ApiOkResponse({ type: DiaEditadoRespuesta })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async editarDia(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('numero', ParseIntPipe) numero: number,
    @Body() datos: EditarDiaPlanDto,
  ): Promise<DiaEditado> {
    return this.editarDiaPlan.ejecutar(usuario.sub, id, numero, datos.rutinaId);
  }

  @ApiTags(TAGS.planificacionPlanes)
  @Get('planes/:id/alumnos')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: ids de los alumnos asignados a un plan propio (US12)' })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiOkResponse({ type: AlumnosDelPlanRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async alumnosDePlan(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ alumnoIds: string[] }> {
    const plan = await this.alumnosDelPlan.consultar(usuario.sub, id);
    return { alumnoIds: [...plan.alumnoIds] };
  }

  @ApiTags(TAGS.planificacionPlanes)
  @Post('planes/:id/alumnos')
  @Roles('Profesor')
  @ApiOperation({
    summary: 'Profesor: agrega un alumno a un plan vigente (US12, RN-PLAN-13, 14, 16)',
  })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiCreatedResponse({ description: 'Alumno agregado al plan.' })
  @ApiBadRequestResponse({ type: ErrorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  @ApiConflictResponse({ type: ErrorRespuesta })
  async agregarAlumno(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: AlumnoDelPlanDto,
  ): Promise<void> {
    await this.alumnosDelPlan.agregar(usuario.sub, id, datos.alumnoId);
  }

  @ApiTags(TAGS.planificacionPlanes)
  @Delete('planes/:id/alumnos/:alumnoId')
  @Roles('Profesor')
  @ApiOperation({ summary: 'Profesor: quita un alumno de un plan vigente (US12, RN-PLAN-16)' })
  @ApiParam(PARAMETRO_ID_UUID)
  @ApiParam({
    name: 'alumnoId',
    description: 'Id del alumno (UUID).',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({ description: 'Alumno quitado del plan.' })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @ApiNotFoundResponse({ type: ErrorRespuesta })
  async quitarAlumno(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('alumnoId', ParseUUIDPipe) alumnoId: string,
  ): Promise<void> {
    await this.alumnosDelPlan.quitar(usuario.sub, id, alumnoId);
  }

  /** Solo Alumno (RN-IDE-03). US08: RN-PLAN-11, 15 y 18. */
  @ApiTags(TAGS.planificacionMiPlan)
  @Get('mi-rutina-del-dia')
  @Roles('Alumno')
  @ApiOperation({
    summary: 'Alumno: rutina del día de su plan vigente, o descanso o sin plan (US08, RN-PLAN-18)',
  })
  @ApiOkResponse({ type: RutinaDelDiaRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async miRutinaDelDia(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ResultadoRutinaDelDia> {
    return this.consultarRutinaDelDia.ejecutar(usuario.sub);
  }

  /** Solo Alumno (RN-IDE-03). US11: RN-PLAN-11, 15 y 19. */
  @ApiTags(TAGS.planificacionMiPlan)
  @Get('mi-plan')
  @Roles('Alumno')
  @ApiOperation({ summary: 'Alumno: su plan vigente con los 28 días (US11, RN-PLAN-19)' })
  @ApiOkResponse({ type: PlanDelAlumnoRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  async miPlan(@UsuarioActual() usuario: UsuarioAutenticado): Promise<ResultadoPlanDelAlumno> {
    return this.consultarPlanDelAlumno.ejecutar(usuario.sub);
  }
}
