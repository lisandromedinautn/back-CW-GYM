import { Controller, Get, Inject, Post } from '@nestjs/common';
import {
  Roles,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ConsultarEntrenamientoEnCurso } from '../../aplicacion/consultar-entrenamiento-en-curso/consultar-entrenamiento-en-curso.caso-uso.js';
import { IniciarEntrenamiento } from '../../aplicacion/iniciar-entrenamiento/iniciar-entrenamiento.caso-uso.js';

@Controller('entrenamiento')
export class EntrenamientoControlador {
  constructor(
    @Inject(IniciarEntrenamiento) private readonly iniciarEntrenamiento: IniciarEntrenamiento,
    @Inject(ConsultarEntrenamientoEnCurso)
    private readonly consultarEntrenamiento: ConsultarEntrenamientoEnCurso,
  ) {}

  @Post('entrenamientos')
  @Roles('Alumno')
  iniciar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.iniciarEntrenamiento.ejecutar(usuario.sub);
  }

  @Get('mi-entrenamiento-en-curso')
  @Roles('Alumno')
  consultar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.consultarEntrenamiento.ejecutar(usuario.sub);
  }
}
