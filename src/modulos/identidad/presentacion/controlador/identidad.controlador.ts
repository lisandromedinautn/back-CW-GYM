import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import {
  ESQUEMA_JWT,
  TAGS,
} from '../../../../compartido/presentacion/swagger/configurar-swagger.js';
import {
  AlumnoEntidadDoc,
  ProfesorEntidadDoc,
  UsuarioEntidadDoc,
} from '../entidades/identidad.entidades.js';
import { ErrorRespuesta } from '../../../../compartido/presentacion/error-respuesta/error-respuesta.js';
import { ConsultarCodigoProfesor } from '../../aplicacion/codigo-profesor/consultar-codigo-profesor.caso-uso.js';
import { DarAltaProfesor } from '../../aplicacion/dar-alta-profesor/dar-alta-profesor.caso-uso.js';
import { GenerarCodigoProfesor } from '../../aplicacion/codigo-profesor/generar-codigo-profesor.caso-uso.js';
import {
  IngresarAlSistema,
  type Ingreso,
} from '../../aplicacion/ingresar-al-sistema/ingresar-al-sistema.caso-uso.js';
import {
  ListarAlumnosDelProfesor,
  type AlumnoDelProfesor,
} from '../../aplicacion/listar-alumnos-del-profesor/listar-alumnos-del-profesor.caso-uso.js';
import {
  VincularAlumno,
  type Vinculo,
} from '../../aplicacion/vincular-alumno/vincular-alumno.caso-uso.js';
import { AltaProfesorDto } from '../alta-profesor/alta-profesor.dto.js';
import { IngresoDto } from '../ingreso/ingreso.dto.js';
import { VinculoDto } from '../vinculo/vinculo.dto.js';
import {
  AltaProfesorRespuesta,
  AlumnoDelProfesorRespuesta,
  CodigoProfesorActualRespuesta,
  CodigoProfesorRespuesta,
  IngresoRespuesta,
  VinculoRespuesta,
} from '../respuestas/identidad.respuestas.js';

@ApiExtraModels(UsuarioEntidadDoc, ProfesorEntidadDoc, AlumnoEntidadDoc)
@Controller('identidad')
export class IdentidadControlador {
  constructor(
    @Inject(IngresarAlSistema) private readonly ingresar: IngresarAlSistema,
    @Inject(DarAltaProfesor) private readonly darAltaProfesor: DarAltaProfesor,
    @Inject(GenerarCodigoProfesor) private readonly generarCodigo: GenerarCodigoProfesor,
    @Inject(ConsultarCodigoProfesor) private readonly consultarCodigo: ConsultarCodigoProfesor,
    @Inject(VincularAlumno) private readonly vincularAlumno: VincularAlumno,
    @Inject(ListarAlumnosDelProfesor)
    private readonly listarAlumnos: ListarAlumnosDelProfesor,
  ) {}

  /** Público. RN-IDE-01. */
  @ApiTags(TAGS.identidadIngreso)
  @ApiOperation({
    summary: 'Ingresar al sistema (público). Devuelve un JWT con el rol del usuario (RN-IDE-01)',
  })
  @ApiOkResponse({ type: IngresoRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @Post('ingreso')
  @HttpCode(HttpStatus.OK)
  ingreso(@Body() datos: IngresoDto): Promise<Ingreso> {
    return this.ingresar.ejecutar(datos);
  }

  /** Solo Admin. RN-IDE-04, 06, 13. */
  @ApiTags(TAGS.identidadProfesores)
  @ApiOperation({
    summary: 'Dar de alta un profesor (rol Admin, RN-IDE-04, 06, 13)',
  })
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiCreatedResponse({ type: AltaProfesorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @Post('profesores')
  @Roles('Admin')
  async altaProfesor(@Body() datos: AltaProfesorDto): Promise<{ id: string; legajo: string }> {
    const profesor = await this.darAltaProfesor.ejecutar(datos);
    return { id: profesor.id, legajo: profesor.legajo };
  }

  /** Solo Profesor. RN-IDE-08: genera un código nuevo e invalida el anterior. */
  @ApiTags(TAGS.identidadProfesores)
  @ApiOperation({
    summary: 'Generar un nuevo Código de Profesor (rol Profesor, RN-IDE-08). Invalida el anterior',
  })
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiCreatedResponse({ type: CodigoProfesorRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @Post('profesores/codigo')
  @Roles('Profesor')
  async generarCodigoProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ codigo: string }> {
    return { codigo: await this.generarCodigo.ejecutar(usuario.sub) };
  }

  /** Solo Profesor. RN-IDE-08: el código vigente, o null si todavía no lo generó. */
  @ApiTags(TAGS.identidadProfesores)
  @ApiOperation({
    summary:
      'Consultar el Código de Profesor vigente (rol Profesor, RN-IDE-08). Devuelve null si no se generó',
  })
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiOkResponse({ type: CodigoProfesorActualRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @Get('profesores/codigo')
  @Roles('Profesor')
  async consultarCodigoProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ codigo: string | null }> {
    return { codigo: await this.consultarCodigo.ejecutar(usuario.sub) };
  }

  /** Solo Profesor. US07: los alumnos vinculados que puede asignar a un plan (RN-PLAN-13). */
  @ApiTags(TAGS.identidadAlumnos)
  @ApiOperation({
    summary:
      'Listar los alumnos vinculados que el profesor puede asignar a un plan (rol Profesor, US07, RN-PLAN-13)',
  })
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiOkResponse({ type: [AlumnoDelProfesorRespuesta] })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @Get('alumnos')
  @Roles('Profesor')
  async alumnosDelProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<AlumnoDelProfesor[]> {
    return this.listarAlumnos.ejecutar(usuario.sub);
  }

  /** Solo Alumno. RN-IDE-09, 10, 11. */
  @ApiTags(TAGS.identidadAlumnos)
  @ApiOperation({
    summary: 'Vincularse a un profesor con su Código de Profesor (rol Alumno, RN-IDE-09, 10, 11)',
  })
  @ApiBearerAuth(ESQUEMA_JWT)
  @ApiOkResponse({ type: VinculoRespuesta })
  @ApiUnauthorizedResponse({ type: ErrorRespuesta })
  @ApiForbiddenResponse({ type: ErrorRespuesta })
  @Post('alumnos/vinculo')
  @Roles('Alumno')
  @HttpCode(HttpStatus.OK)
  vinculo(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: VinculoDto,
  ): Promise<Vinculo> {
    return this.vincularAlumno.ejecutar(usuario.sub, datos.codigo);
  }
}
