import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
import { CrearRutina } from './aplicacion/crear-rutina.caso-uso.js';
import { ConsultaEjercicios } from './dominio/consulta-ejercicios.puerto.js';
import { RepositorioRutinas } from './dominio/repositorio-rutinas.puerto.js';
import { ConsultaEjerciciosFachadaCatalogo } from './infraestructura/consulta-ejercicios.fachada-catalogo.js';
import { BloqueRutinaEsquema, RutinaEsquema } from './infraestructura/rutina.esquema.js';
import { RepositorioRutinasTypeorm } from './infraestructura/rutina.repositorio-typeorm.js';
import { PlanificacionControlador } from './presentacion/planificacion.controlador.js';

/** Planificación. Los casos de uso no conocen Nest: se arman acá con fábricas. */
@Module({
  imports: [TypeOrmModule.forFeature([RutinaEsquema, BloqueRutinaEsquema]), CatalogoModule],
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
