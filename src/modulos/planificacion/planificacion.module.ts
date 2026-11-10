import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
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
  ],
})
export class PlanificacionModule {}
