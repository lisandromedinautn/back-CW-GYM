import { Inject, Logger, Module, type OnApplicationBootstrap } from '@nestjs/common';
import { NormalizarNombresRutinas } from './aplicacion/normalizar-nombres-rutinas/normalizar-nombres-rutinas.caso-uso.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
import { ModuloIdentidad } from '../identidad/identidad.module.js';
import { ConsultarRutinas } from './aplicacion/consultar-rutinas/consultar-rutinas.caso-uso.js';
import { RenombrarRutina } from './aplicacion/renombrar-rutina/renombrar-rutina.caso-uso.js';
import { CrearRutina } from './aplicacion/crear-rutina/crear-rutina.caso-uso.js';
import { CrearPlan } from './aplicacion/crear-plan/crear-plan.caso-uso.js';
import { ConsultarRutinaDelDia } from './aplicacion/consultar-rutina-del-dia/consultar-rutina-del-dia.caso-uso.js';
import { PUBLICADOR_EVENTOS } from '../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { PublicadorEventos } from '../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import { Reloj } from '../../compartido/dominio/reloj/reloj.puerto.js';
import { RelojSistema } from '../../compartido/infraestructura/reloj/reloj-sistema.js';
import { ConsultaVinculos } from './dominio/plan/consulta-vinculos.puerto.js';
import { RepositorioPlanes } from './dominio/plan/repositorio-planes.puerto.js';
import { ConsultaEjercicios } from './dominio/rutina/consulta-ejercicios.puerto.js';
import { ConsultaNombresEjercicios } from './dominio/rutina/consulta-nombres-ejercicios.puerto.js';
import { RepositorioRutinas } from './dominio/rutina/repositorio-rutinas.puerto.js';
import { ConsultaVinculosFachadaIdentidad } from './infraestructura/plan/consulta-vinculos.fachada-identidad.js';
import {
  DiaPlanEsquema,
  PlanAlumnoEsquema,
  PlanEsquema,
} from './infraestructura/plan/plan.esquema.js';
import { RepositorioPlanesTypeorm } from './infraestructura/plan/plan.repositorio-typeorm.js';
import { ConsultaEjerciciosFachadaCatalogo } from './infraestructura/rutina/consulta-ejercicios.fachada-catalogo.js';
import { ConsultaNombresEjerciciosFachadaCatalogo } from './infraestructura/rutina/consulta-nombres-ejercicios.fachada-catalogo.js';
import {
  BloqueRutinaEsquema,
  CircuitoRutinaEsquema,
  EjercicioCircuitoEsquema,
  RutinaEsquema,
} from './infraestructura/rutina/rutina.esquema.js';
import { RepositorioRutinasTypeorm } from './infraestructura/rutina/rutina.repositorio-typeorm.js';
import { PlanificacionControlador } from './presentacion/controlador/planificacion.controlador.js';

/** Planificación. Los casos de uso no conocen Nest: se arman acá con fábricas. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RutinaEsquema,
      BloqueRutinaEsquema,
      CircuitoRutinaEsquema,
      EjercicioCircuitoEsquema,
      PlanEsquema,
      DiaPlanEsquema,
      PlanAlumnoEsquema,
    ]),
    CatalogoModule,
    ModuloIdentidad,
  ],
  controllers: [PlanificacionControlador],
  providers: [
    { provide: RepositorioRutinas, useClass: RepositorioRutinasTypeorm },
    { provide: ConsultaEjercicios, useClass: ConsultaEjerciciosFachadaCatalogo },
    { provide: ConsultaNombresEjercicios, useClass: ConsultaNombresEjerciciosFachadaCatalogo },
    { provide: RepositorioPlanes, useClass: RepositorioPlanesTypeorm },
    { provide: ConsultaVinculos, useClass: ConsultaVinculosFachadaIdentidad },
    { provide: Reloj, useClass: RelojSistema },
    {
      provide: CrearRutina,
      inject: [RepositorioRutinas, ConsultaEjercicios],
      useFactory: (rutinas: RepositorioRutinas, ejercicios: ConsultaEjercicios) =>
        new CrearRutina(rutinas, ejercicios),
    },
    {
      provide: ConsultarRutinas,
      inject: [RepositorioRutinas],
      useFactory: (rutinas: RepositorioRutinas) => new ConsultarRutinas(rutinas),
    },
    {
      provide: RenombrarRutina,
      inject: [RepositorioRutinas],
      useFactory: (rutinas: RepositorioRutinas) => new RenombrarRutina(rutinas),
    },
    {
      provide: NormalizarNombresRutinas,
      inject: [RepositorioRutinas],
      useFactory: (rutinas: RepositorioRutinas) => new NormalizarNombresRutinas(rutinas),
    },
    {
      provide: CrearPlan,
      inject: [RepositorioPlanes, RepositorioRutinas, ConsultaVinculos, Reloj, PUBLICADOR_EVENTOS],
      useFactory: (
        planes: RepositorioPlanes,
        rutinas: RepositorioRutinas,
        vinculos: ConsultaVinculos,
        reloj: Reloj,
        publicador: PublicadorEventos,
      ) => new CrearPlan(planes, rutinas, vinculos, reloj, publicador),
    },
    {
      provide: ConsultarRutinaDelDia,
      inject: [
        RepositorioPlanes,
        RepositorioRutinas,
        ConsultaVinculos,
        ConsultaNombresEjercicios,
        Reloj,
      ],
      useFactory: (
        planes: RepositorioPlanes,
        rutinas: RepositorioRutinas,
        vinculos: ConsultaVinculos,
        nombres: ConsultaNombresEjercicios,
        reloj: Reloj,
      ) => new ConsultarRutinaDelDia(planes, rutinas, vinculos, nombres, reloj),
    },
  ],
})
export class PlanificacionModule implements OnApplicationBootstrap {
  private readonly registro = new Logger('Planificacion');

  constructor(
    @Inject(NormalizarNombresRutinas) private readonly normalizarNombres: NormalizarNombresRutinas,
  ) {}

  /** RN-PLAN-21: al arrancar, las rutinas con nombre repetido pasan al siguiente "Rutina N" libre. */
  async onApplicationBootstrap(): Promise<void> {
    const renombradas = await this.normalizarNombres.ejecutar();
    if (renombradas > 0) {
      this.registro.log(`Se renombraron ${renombradas} rutinas con nombre repetido (RN-PLAN-21)`);
    }
  }
}
