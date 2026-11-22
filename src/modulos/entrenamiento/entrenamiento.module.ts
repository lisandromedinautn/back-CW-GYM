import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PUBLICADOR_EVENTOS,
  type PublicadorEventos,
} from '../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import { Reloj } from '../../compartido/dominio/reloj/reloj.puerto.js';
import { RelojSistema } from '../../compartido/infraestructura/reloj/reloj-sistema.js';
import { FachadaIdentidad } from '../identidad/fachada-identidad.js';
import { ModuloIdentidad } from '../identidad/identidad.module.js';
import { FachadaPlanificacion } from '../planificacion/fachada-planificacion.js';
import { PlanificacionModule } from '../planificacion/planificacion.module.js';
import { ConsultarEntrenamientoEnCurso } from './aplicacion/consultar-entrenamiento-en-curso/consultar-entrenamiento-en-curso.caso-uso.js';
import { IniciarEntrenamiento } from './aplicacion/iniciar-entrenamiento/iniciar-entrenamiento.caso-uso.js';
import { RegistrarSerieRealizada } from './aplicacion/registrar-serie-realizada/registrar-serie-realizada.caso-uso.js';
import { RepositorioEntrenamientos } from './dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import { EntrenamientoEsquema } from './infraestructura/entrenamiento/entrenamiento.esquema.js';
import { SerieRealizadaEsquema } from './infraestructura/entrenamiento/serie-realizada.esquema.js';
import { RepositorioEntrenamientosTypeorm } from './infraestructura/entrenamiento/entrenamiento.repositorio-typeorm.js';
import { EntrenamientoControlador } from './presentacion/controlador/entrenamiento.controlador.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntrenamientoEsquema, SerieRealizadaEsquema]),
    ModuloIdentidad,
    PlanificacionModule,
  ],
  controllers: [EntrenamientoControlador],
  providers: [
    { provide: Reloj, useClass: RelojSistema },
    { provide: RepositorioEntrenamientos, useClass: RepositorioEntrenamientosTypeorm },
    {
      provide: IniciarEntrenamiento,
      inject: [
        RepositorioEntrenamientos,
        FachadaIdentidad,
        FachadaPlanificacion,
        Reloj,
        PUBLICADOR_EVENTOS,
      ],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        planificacion: FachadaPlanificacion,
        reloj: Reloj,
        publicador: PublicadorEventos,
      ) => new IniciarEntrenamiento(repositorio, identidad, planificacion, reloj, publicador),
    },
    {
      provide: RegistrarSerieRealizada,
      inject: [RepositorioEntrenamientos, FachadaIdentidad, Reloj, PUBLICADOR_EVENTOS],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        reloj: Reloj,
        publicador: PublicadorEventos,
      ) => new RegistrarSerieRealizada(repositorio, identidad, reloj, publicador),
    },
    {
      provide: ConsultarEntrenamientoEnCurso,
      inject: [RepositorioEntrenamientos, FachadaIdentidad, Reloj],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        reloj: Reloj,
      ) => new ConsultarEntrenamientoEnCurso(repositorio, identidad, reloj),
    },
  ],
})
export class EntrenamientoModule {}
