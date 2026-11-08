import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../compartido/presentacion/guard-roles.js';
import { CrearRutina } from '../aplicacion/crear-rutina.caso-uso.js';
import type { Rutina } from '../dominio/rutina.entidad.js';
import { CrearRutinaDto } from './crear-rutina.dto.js';

/** Rutina tal como la recibe el front. */
export interface RutinaRespuesta {
  id: string;
  tipo: string;
  bloques: {
    ejercicioId: string;
    series: number;
    micropausaSegundos: number;
    macropausaSegundos: number;
    repeticiones: number | null;
    segundos: number | null;
    pesoKg: number | null;
  }[];
}

const aRespuesta = (rutina: Rutina): RutinaRespuesta => ({
  id: rutina.id,
  tipo: rutina.tipo.valor,
  bloques: rutina.bloques.map((bloque) => ({
    ejercicioId: bloque.ejercicio.ejercicioId,
    series: bloque.series,
    micropausaSegundos: bloque.micropausa.segundos,
    macropausaSegundos: bloque.macropausa.segundos,
    repeticiones: bloque.ejercicio.objetivo.repeticiones,
    segundos: bloque.ejercicio.objetivo.segundos,
    pesoKg: bloque.ejercicio.objetivo.pesoKg,
  })),
});

@Controller('planificacion')
export class PlanificacionControlador {
  constructor(@Inject(CrearRutina) private readonly crearRutina: CrearRutina) {}

  /** Solo Profesor (RN-IDE-03). US06: RN-PLAN-01, 02, 04, 05, 06. */
  @Post('rutinas')
  @Roles('Profesor')
  async crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: CrearRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.crearRutina.ejecutar(usuario.sub, datos));
  }
}
