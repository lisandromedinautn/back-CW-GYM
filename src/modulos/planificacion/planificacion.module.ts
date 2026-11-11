import { Inject, Logger, Module, type OnApplicationBootstrap } from '@nestjs/common';
import { NormalizarNombresRutinas } from './aplicacion/normalizar-nombres-rutinas/normalizar-nombres-rutinas.caso-uso.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
import { ConsultarRutinas } from './aplicacion/consultar-rutinas/consultar-rutinas.caso-uso.js';
import { RenombrarRutina } from './aplicacion/renombrar-rutina/renombrar-rutina.caso-uso.js';
import { CrearRutina } from './aplicacion/crear-rutina/crear-rutina.caso-uso.js';
import { ConsultaEjercicios } from './dominio/rutina/consulta-ejercicios.puerto.js';
import { RepositorioRutinas } from './dominio/rutina/repositorio-rutinas.puerto.js';
import { ConsultaEjerciciosFachadaCatalogo } from './infraestructura/rutina/consulta-ejercicios.fachada-catalogo.js';
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
    ]),
    CatalogoModule,
  ],
  controllers: [PlanificacionControlador],
  providers: [
    { provide: RepositorioRutinas, useClass: RepositorioRutinasTypeorm },
    { provide: ConsultaEjercicios, useClass: ConsultaEjerciciosFachadaCatalogo },
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
