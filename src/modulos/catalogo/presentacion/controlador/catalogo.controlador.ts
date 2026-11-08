import { Controller, Get, Inject } from '@nestjs/common';
import { Roles } from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ListarEjercicios } from '../../aplicacion/listar-ejercicios/listar-ejercicios.caso-uso.js';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';

/** Ejercicio tal como lo recibe el front (RN-CAT-01, 05, 09). */
export interface EjercicioRespuesta {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  tipoCarga: string;
  factorPesoCorporal: number | null;
  musculoPrincipal: string;
  grupoMuscular: string;
  musculoSecundario: string | null;
  urlGif: string;
  atribucion: string;
}

const aRespuesta = (ejercicio: Ejercicio): EjercicioRespuesta => ({
  id: ejercicio.id,
  nombre: ejercicio.nombre,
  descripcion: ejercicio.descripcion,
  tipo: ejercicio.tipo.valor,
  tipoCarga: ejercicio.tipoCarga.valor,
  factorPesoCorporal: ejercicio.factorPesoCorporal?.porcentaje ?? null,
  musculoPrincipal: ejercicio.musculoPrincipal.nombre,
  grupoMuscular: ejercicio.musculoPrincipal.grupo,
  musculoSecundario: ejercicio.musculoSecundario?.nombre ?? null,
  urlGif: ejercicio.urlGif,
  atribucion: ejercicio.atribucion,
});

@Controller('catalogo')
export class CatalogoControlador {
  constructor(@Inject(ListarEjercicios) private readonly listar: ListarEjercicios) {}

  /** Admin y Profesor (RN-IDE-03). Lo usan la lista de ejercicios y, en US06, el editor de rutinas. */
  @Get('ejercicios')
  @Roles('Admin', 'Profesor')
  async ejercicios(): Promise<EjercicioRespuesta[]> {
    return (await this.listar.ejecutar()).map(aRespuesta);
  }
}
