import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
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
  @Post('ingreso')
  @HttpCode(HttpStatus.OK)
  ingreso(@Body() datos: IngresoDto): Promise<Ingreso> {
    return this.ingresar.ejecutar(datos);
  }

  /** Solo Admin. RN-IDE-04, 06, 13. */
  @Post('profesores')
  @Roles('Admin')
  async altaProfesor(@Body() datos: AltaProfesorDto): Promise<{ id: string; legajo: string }> {
    const profesor = await this.darAltaProfesor.ejecutar(datos);
    return { id: profesor.id, legajo: profesor.legajo };
  }

  /** Solo Profesor. RN-IDE-08: genera un código nuevo e invalida el anterior. */
  @Post('profesores/codigo')
  @Roles('Profesor')
  async generarCodigoProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ codigo: string }> {
    return { codigo: await this.generarCodigo.ejecutar(usuario.sub) };
  }

  /** Solo Profesor. RN-IDE-08: el código vigente, o null si todavía no lo generó. */
  @Get('profesores/codigo')
  @Roles('Profesor')
  async consultarCodigoProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ codigo: string | null }> {
    return { codigo: await this.consultarCodigo.ejecutar(usuario.sub) };
  }

  /** Solo Profesor. US07: los alumnos vinculados que puede asignar a un plan (RN-PLAN-13). */
  @Get('alumnos')
  @Roles('Profesor')
  async alumnosDelProfesor(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<AlumnoDelProfesor[]> {
    return this.listarAlumnos.ejecutar(usuario.sub);
  }

  /** Solo Alumno. RN-IDE-09, 10, 11. */
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
