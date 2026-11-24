import { ConsultaEjerciciosResumenFachadaCatalogo } from './infraestructura/entrenamiento/consulta-ejercicios-resumen.fachada-catalogo.js';
import { RepositorioCierreEntrenamiento } from './dominio/entrenamiento/repositorio-cierre-entrenamiento.puerto.js';
import { FinalizarEntrenamiento } from './aplicacion/finalizar-entrenamiento/finalizar-entrenamiento.caso-uso.js';
import { CerrarEntrenamiento } from './aplicacion/finalizar-entrenamiento/cerrar-entrenamiento.caso-uso.js';
import { CerrarEntrenamientoConRecords } from './aplicacion/finalizar-entrenamiento/cerrar-entrenamiento-con-records.caso-uso.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PUBLICADOR_EVENTOS,
  type PublicadorEventos,
} from '../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import { Reloj } from '../../compartido/dominio/reloj/reloj.puerto.js';
import { RelojSistema } from '../../compartido/infraestructura/reloj/reloj-sistema.js';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
import { FachadaCatalogo } from '../catalogo/fachada-catalogo.js';
import { FachadaIdentidad } from '../identidad/fachada-identidad.js';
import { ModuloIdentidad } from '../identidad/identidad.module.js';
import { FachadaPlanificacion } from '../planificacion/fachada-planificacion.js';
import { PlanificacionModule } from '../planificacion/planificacion.module.js';
import { ConsultarEntrenamientosDeAlumnos } from './aplicacion/consultar-entrenamientos-de-alumnos/consultar-entrenamientos-de-alumnos.caso-uso.js';
import { ConsultarEntrenamientoEnCurso } from './aplicacion/consultar-entrenamiento-en-curso/consultar-entrenamiento-en-curso.caso-uso.js';
import { IniciarEntrenamiento } from './aplicacion/iniciar-entrenamiento/iniciar-entrenamiento.caso-uso.js';
import { RegistrarSerieRealizada } from './aplicacion/registrar-serie-realizada/registrar-serie-realizada.caso-uso.js';
import { RepositorioEntrenamientos } from './dominio/entrenamiento/repositorio-entrenamientos.puerto.js';
import { DetectorRecords } from './dominio/record-personal/detector-records.js';
import { RepositorioRecords } from './dominio/record-personal/repositorio-records.puerto.js';
import { MarcasPorTipoEjercicio } from './dominio/marcas-por-tipo-ejercicio/marcas-por-tipo-ejercicio.js';
import { EntrenamientoEsquema } from './infraestructura/entrenamiento/entrenamiento.esquema.js';
import { SerieRealizadaEsquema } from './infraestructura/entrenamiento/serie-realizada.esquema.js';
import { RepositorioEntrenamientosTypeorm } from './infraestructura/entrenamiento/entrenamiento.repositorio-typeorm.js';
import { ConsultaEjerciciosRecordsFachadaCatalogo } from './infraestructura/entrenamiento/consulta-ejercicios-records.fachada-catalogo.js';
import { RecordPersonalEsquema } from './infraestructura/record-personal/record-personal.esquema.js';
import { RepositorioRecordsTypeorm } from './infraestructura/record-personal/record-personal.repositorio-typeorm.js';
import { EntrenamientoControlador } from './presentacion/controlador/entrenamiento.controlador.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntrenamientoEsquema, SerieRealizadaEsquema, RecordPersonalEsquema]),
    ModuloIdentidad,
    PlanificacionModule,
    CatalogoModule,
  ],
  controllers: [EntrenamientoControlador],
  providers: [
    { provide: Reloj, useClass: RelojSistema },
    { provide: RepositorioEntrenamientos, useClass: RepositorioEntrenamientosTypeorm },
    { provide: RepositorioCierreEntrenamiento, useExisting: RepositorioEntrenamientos },
    { provide: RepositorioRecords, useClass: RepositorioRecordsTypeorm },
    ConsultaEjerciciosResumenFachadaCatalogo,
    ConsultaEjerciciosRecordsFachadaCatalogo,
    {
      provide: FinalizarEntrenamiento,
      inject: [
        RepositorioEntrenamientos,
        FachadaIdentidad,
        ConsultaEjerciciosResumenFachadaCatalogo,
        Reloj,
      ],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        ejercicios: ConsultaEjerciciosResumenFachadaCatalogo,
        reloj: Reloj,
      ) => new FinalizarEntrenamiento(repositorio, identidad, ejercicios, reloj),
    },
    {
      provide: CerrarEntrenamiento,
      inject: [
        RepositorioEntrenamientos,
        RepositorioCierreEntrenamiento,
        FachadaIdentidad,
        Reloj,
        FinalizarEntrenamiento,
        PUBLICADOR_EVENTOS,
      ],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        cierre: RepositorioCierreEntrenamiento,
        identidad: FachadaIdentidad,
        reloj: Reloj,
        calculo: FinalizarEntrenamiento,
        publicador: PublicadorEventos,
      ) => new CerrarEntrenamiento(repositorio, cierre, identidad, reloj, calculo, publicador),
    },
    {
      provide: CerrarEntrenamientoConRecords,
      inject: [
        CerrarEntrenamiento,
        RepositorioEntrenamientos,
        RepositorioRecords,
        ConsultaEjerciciosRecordsFachadaCatalogo,
        PUBLICADOR_EVENTOS,
      ],
      useFactory: (
        cerrar: CerrarEntrenamiento,
        repositorio: RepositorioEntrenamientos,
        records: RepositorioRecords,
        catalogo: ConsultaEjerciciosRecordsFachadaCatalogo,
        publicador: PublicadorEventos,
      ) =>
        new CerrarEntrenamientoConRecords(
          cerrar,
          repositorio,
          records,
          catalogo,
          new MarcasPorTipoEjercicio(),
          new DetectorRecords(),
          publicador,
        ),
    },
    {
      provide: IniciarEntrenamiento,
      inject: [
        RepositorioEntrenamientos,
        FachadaIdentidad,
        FachadaPlanificacion,
        Reloj,
        PUBLICADOR_EVENTOS,
        FachadaCatalogo,
      ],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        planificacion: FachadaPlanificacion,
        reloj: Reloj,
        publicador: PublicadorEventos,
        catalogo: FachadaCatalogo,
      ) =>
        new IniciarEntrenamiento(
          repositorio,
          identidad,
          planificacion,
          reloj,
          publicador,
          catalogo,
        ),
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
    {
      provide: ConsultarEntrenamientosDeAlumnos,
      inject: [RepositorioEntrenamientos, FachadaIdentidad, Reloj],
      useFactory: (
        repositorio: RepositorioEntrenamientos,
        identidad: FachadaIdentidad,
        reloj: Reloj,
      ) => new ConsultarEntrenamientosDeAlumnos(repositorio, identidad, reloj),
    },
  ],
})
export class EntrenamientoModule {}
