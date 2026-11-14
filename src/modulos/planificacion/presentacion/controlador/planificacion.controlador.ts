import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ConsultarRutinas } from '../../aplicacion/consultar-rutinas/consultar-rutinas.caso-uso.js';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { PaginacionDto } from '../../../../compartido/presentacion/paginacion/paginacion.dto.js';
import { RenombrarRutina } from '../../aplicacion/renombrar-rutina/renombrar-rutina.caso-uso.js';
import { CrearRutina } from '../../aplicacion/crear-rutina/crear-rutina.caso-uso.js';
import { CrearPlan } from '../../aplicacion/crear-plan/crear-plan.caso-uso.js';
import {
  ConsultarRutinaDelDia,
  type ResultadoRutinaDelDia,
} from '../../aplicacion/consultar-rutina-del-dia/consultar-rutina-del-dia.caso-uso.js';
import type { Plan } from '../../dominio/plan/plan.entidad.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { CrearPlanDto } from '../crear-plan/crear-plan.dto.js';
import { CrearRutinaDto, RenombrarRutinaDto } from '../crear-rutina/crear-rutina.dto.js';

/** Rutina tal como la recibe el front. */
export interface RutinaRespuesta {
  id: string;
  /** RN-PLAN-21. */
  nombre: string;
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

/** Una página de la consulta de rutinas. `pagina` arranca en 1. */
export interface PaginaRutinasRespuesta {
  items: RutinaRespuesta[];
  total: number;
  pagina: number;
  tamanio: number;
}

/** Plan de Entrenamiento tal como lo recibe el front (US07). */
export interface PlanRespuesta {
  id: string;
  /** RN-PLAN-09: fecha de fin calculada. */
  fechaInicio: string;
  fechaFin: string;
  /** RN-PLAN-10, 11: cada día con su fecha; sin rutina es descanso. */
  dias: {
    numero: number;
    fecha: string;
    rutinaId: string | null;
    esDescanso: boolean;
  }[];
  alumnoIds: string[];
}

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
  constructor(
    @Inject(CrearRutina) private readonly crearRutina: CrearRutina,
    @Inject(ConsultarRutinas) private readonly consultarRutinas: ConsultarRutinas,
    @Inject(RenombrarRutina) private readonly renombrarRutina: RenombrarRutina,
    @Inject(CrearPlan) private readonly crearPlan: CrearPlan,
    @Inject(ConsultarRutinaDelDia)
    private readonly consultarRutinaDelDia: ConsultarRutinaDelDia,
  ) {}

  /** Solo Profesor (RN-IDE-03). T06: consulta paginada de sus propias rutinas (RN-PLAN-08). */
  @Get('rutinas')
  @Roles('Profesor')
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

  /** Solo Profesor (RN-IDE-03). US06: RN-PLAN-01, 02, 04, 05, 06. US09: RN-PLAN-03, 20. */
  @Post('rutinas')
  @Roles('Profesor')
  async crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: CrearRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.crearRutina.ejecutar(usuario.sub, datos));
  }

  /** Solo Profesor (RN-IDE-03). T08: RN-PLAN-21 (nombre) y RN-PLAN-08 (solo sus rutinas). */
  @Patch('rutinas/:id/nombre')
  @Roles('Profesor')
  async renombrar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() datos: RenombrarRutinaDto,
  ): Promise<RutinaRespuesta> {
    return aRespuesta(await this.renombrarRutina.ejecutar(usuario.sub, id, datos.nombre));
  }

  /** Solo Profesor (RN-IDE-03). US07: RN-PLAN-09 a 15 y 17. */
  @Post('planes')
  @Roles('Profesor')
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

  /** Solo Alumno (RN-IDE-03). US08: RN-PLAN-11, 15 y 18. */
  @Get('mi-rutina-del-dia')
  @Roles('Alumno')
  async miRutinaDelDia(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ResultadoRutinaDelDia> {
    return this.consultarRutinaDelDia.ejecutar(usuario.sub);
  }
}
