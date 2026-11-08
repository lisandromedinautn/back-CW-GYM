import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { Roles } from '../../../compartido/presentacion/guard-roles.js';
import { DarAltaProfesor } from '../aplicacion/dar-alta-profesor.caso-uso.js';
import { IngresarAlSistema, type Ingreso } from '../aplicacion/ingresar-al-sistema.caso-uso.js';
import { AltaProfesorDto } from './alta-profesor.dto.js';
import { IngresoDto } from './ingreso.dto.js';

@Controller('identidad')
export class IdentidadControlador {
  constructor(
    @Inject(IngresarAlSistema) private readonly ingresar: IngresarAlSistema,
    @Inject(DarAltaProfesor) private readonly darAltaProfesor: DarAltaProfesor,
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
}
