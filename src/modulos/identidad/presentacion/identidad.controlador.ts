import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { IngresarAlSistema, type Ingreso } from '../aplicacion/ingresar-al-sistema.caso-uso.js';
import { IngresoDto } from './ingreso.dto.js';

@Controller('identidad')
export class IdentidadControlador {
  constructor(@Inject(IngresarAlSistema) private readonly ingresar: IngresarAlSistema) {}

  /** Público. RN-IDE-01. */
  @Post('ingreso')
  @HttpCode(HttpStatus.OK)
  ingreso(@Body() datos: IngresoDto): Promise<Ingreso> {
    return this.ingresar.ejecutar(datos);
  }
}
