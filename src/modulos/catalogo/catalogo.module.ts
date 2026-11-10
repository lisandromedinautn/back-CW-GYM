import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargarDatasetEjercicios } from './aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { ListarEjercicios } from './aplicacion/listar-ejercicios/listar-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from './dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { RepositorioEjercicios } from './dominio/ejercicio/repositorio-ejercicios.puerto.js';
import { EjercicioEsquema } from './infraestructura/ejercicio/ejercicio.esquema.js';
import { FuenteDatasetEjerciciosArchivo } from './infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { RepositorioEjerciciosTypeorm } from './infraestructura/ejercicio/ejercicio.repositorio-typeorm.js';
import { CatalogoControlador } from './presentacion/controlador/catalogo.controlador.js';
import { FachadaCatalogo } from './fachada-catalogo.js';

@Module({
  imports: [TypeOrmModule.forFeature([EjercicioEsquema])],
  controllers: [CatalogoControlador],
  providers: [
    { provide: RepositorioEjercicios, useClass: RepositorioEjerciciosTypeorm },
    { provide: FuenteDatasetEjercicios, useFactory: () => new FuenteDatasetEjerciciosArchivo() },
    {
      provide: CargarDatasetEjercicios,
      useFactory: (fuente: FuenteDatasetEjercicios, repositorio: RepositorioEjercicios) =>
        new CargarDatasetEjercicios(fuente, repositorio),
      inject: [FuenteDatasetEjercicios, RepositorioEjercicios],
    },
    {
      provide: ListarEjercicios,
      useFactory: (repositorio: RepositorioEjercicios) => new ListarEjercicios(repositorio),
      inject: [RepositorioEjercicios],
    },
    FachadaCatalogo,
  ],
  exports: [CargarDatasetEjercicios, ListarEjercicios, FachadaCatalogo],
})
export class CatalogoModule {}
