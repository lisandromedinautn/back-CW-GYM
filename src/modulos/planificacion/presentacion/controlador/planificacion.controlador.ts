import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { CrearRutina } from '../../aplicacion/crear-rutina/crear-rutina.caso-uso.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { CrearRutinaDto } from '../crear-rutina/crear-rutina.dto.js';

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
  /** US09. Un circuito no tiene micropausa (RN-PLAN-03). */
  circuitos: {
    vueltas: number;
    macropausaSegundos: number;
    ejercicios: {
      ejercicioId: string;
      repeticiones: number | null;
      segundos: number | null;
      pesoKg: number | null;
    }[];
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
  circuitos: rutina.circuitos.map((circuito) => ({
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

@Controller('planificacion')
export class PlanificacionControlador {
  constructor(@Inject(CrearRutina) private readonly crearRutina: CrearRutina) {}

  /** Solo Profesor (RN-IDE-03). US06: RN-PLAN-01, 02, 04, 05, 06. US09: RN-PLAN-03, 20. */
  @Post('rutinas')
  @Roles('Profesor')
  async crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: CrearRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.crearRutina.ejecutar(usuario.sub, datos));
  }
}
