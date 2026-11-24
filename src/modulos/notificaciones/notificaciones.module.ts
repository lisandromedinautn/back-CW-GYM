import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reloj } from '../../compartido/dominio/reloj/reloj.puerto.js';
import { RelojSistema } from '../../compartido/infraestructura/reloj/reloj-sistema.js';
import { ModuloIdentidad } from '../identidad/identidad.module.js';
import { ConsultarNotificaciones } from './aplicacion/consultar-notificaciones/consultar-notificaciones.caso-uso.js';
import { ContarNoLeidas } from './aplicacion/contar-no-leidas/contar-no-leidas.caso-uso.js';
import { MarcarNotificacionLeida } from './aplicacion/marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.js';
import { SumarPercepcion } from './aplicacion/sumar-percepcion/sumar-percepcion.caso-uso.js';
import { NotificarEntrenamientoPorDebajo } from './aplicacion/notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.js';
import { AlertarIncumplimientoRepetido } from './aplicacion/alertar-incumplimiento-repetido/alertar-incumplimiento-repetido.caso-uso.js';
import { RepositorioFinalizaciones } from './dominio/incumplimiento/repositorio-finalizaciones.puerto.js';
import { FinalizacionEsquema } from './infraestructura/incumplimiento/finalizacion.esquema.js';
import { RepositorioFinalizacionesTypeorm } from './infraestructura/incumplimiento/finalizaciones.repositorio-typeorm.js';
import { IncumplimientoRepetidoSuscriptor } from './infraestructura/suscriptores/incumplimiento-repetido.suscriptor.js';
import { ConsultaProfesores } from './dominio/notificacion/consulta-profesores.puerto.js';
import { RepositorioNotificaciones } from './dominio/notificacion/repositorio-notificaciones.puerto.js';
import { ConsultaProfesoresFachadaIdentidad } from './infraestructura/notificacion/consulta-profesores.fachada-identidad.js';
import { NotificacionEsquema } from './infraestructura/notificacion/notificacion.esquema.js';
import { RepositorioNotificacionesTypeorm } from './infraestructura/notificacion/notificaciones.repositorio-typeorm.js';
import { EntrenamientoFinalizadoSuscriptor } from './infraestructura/suscriptores/entrenamiento-finalizado.suscriptor.js';
import { PercepcionRegistradaSuscriptor } from './infraestructura/suscriptores/percepcion-registrada.suscriptor.js';
import { NotificacionesControlador } from './presentacion/controlador/notificaciones.controlador.js';

/** Notificaciones (US21). Los casos de uso no conocen Nest: se arman acá con fábricas. */
@Module({
  imports: [TypeOrmModule.forFeature([NotificacionEsquema, FinalizacionEsquema]), ModuloIdentidad],
  controllers: [NotificacionesControlador],
  providers: [
    { provide: Reloj, useClass: RelojSistema },
    { provide: RepositorioNotificaciones, useClass: RepositorioNotificacionesTypeorm },
    { provide: RepositorioFinalizaciones, useClass: RepositorioFinalizacionesTypeorm },
    { provide: ConsultaProfesores, useClass: ConsultaProfesoresFachadaIdentidad },
    {
      provide: AlertarIncumplimientoRepetido,
      inject: [RepositorioNotificaciones, RepositorioFinalizaciones, ConsultaProfesores, Reloj],
      useFactory: (
        n: RepositorioNotificaciones,
        f: RepositorioFinalizaciones,
        p: ConsultaProfesores,
        reloj: Reloj,
      ) => new AlertarIncumplimientoRepetido(n, f, p, reloj),
    },
    {
      provide: NotificarEntrenamientoPorDebajo,
      inject: [RepositorioNotificaciones, ConsultaProfesores, Reloj],
      useFactory: (r: RepositorioNotificaciones, p: ConsultaProfesores, reloj: Reloj) =>
        new NotificarEntrenamientoPorDebajo(r, p, reloj),
    },
    {
      provide: ConsultarNotificaciones,
      inject: [RepositorioNotificaciones, ConsultaProfesores],
      useFactory: (r: RepositorioNotificaciones, p: ConsultaProfesores) =>
        new ConsultarNotificaciones(r, p),
    },
    {
      provide: ContarNoLeidas,
      inject: [RepositorioNotificaciones, ConsultaProfesores],
      useFactory: (r: RepositorioNotificaciones, p: ConsultaProfesores) => new ContarNoLeidas(r, p),
    },
    {
      provide: MarcarNotificacionLeida,
      inject: [RepositorioNotificaciones, ConsultaProfesores, Reloj],
      useFactory: (r: RepositorioNotificaciones, p: ConsultaProfesores, reloj: Reloj) =>
        new MarcarNotificacionLeida(r, p, reloj),
    },
    {
      provide: SumarPercepcion,
      inject: [RepositorioNotificaciones, ConsultaProfesores, Reloj],
      useFactory: (r: RepositorioNotificaciones, p: ConsultaProfesores, reloj: Reloj) =>
        new SumarPercepcion(r, p, reloj),
    },
    EntrenamientoFinalizadoSuscriptor,
    IncumplimientoRepetidoSuscriptor,
    PercepcionRegistradaSuscriptor,
  ],
})
export class NotificacionesModule {}
