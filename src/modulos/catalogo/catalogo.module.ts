import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargarDatasetEjercicios } from './aplicacion/cargar-dataset-ejercicios.caso-uso.js';
import { ListarEjercicios } from './aplicacion/listar-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from './dominio/fuente-dataset-ejercicios.js';
import { RepositorioEjercicios } from './dominio/repositorio-ejercicios.js';
import { EjercicioEsquema } from './infraestructura/ejercicio.esquema.js';
import { FuenteDatasetEjerciciosArchivo } from './infraestructura/fuente-dataset-ejercicios.archivo.js';
import { RepositorioEjerciciosTypeorm } from './infraestructura/repositorio-ejercicios.typeorm.js';

@Module({
  imports: [TypeOrmModule.forFeature([EjercicioEsquema])],
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
  ],
  exports: [CargarDatasetEjercicios, ListarEjercicios],
})
export class CatalogoModule {}
