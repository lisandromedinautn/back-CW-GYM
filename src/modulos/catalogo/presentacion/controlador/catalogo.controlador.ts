import { Controller, Get, Inject, Query } from '@nestjs/common';
import { Roles } from '../../../../compartido/presentacion/guard-roles/guard-roles.js';
import { ConsultarEjercicios } from '../../aplicacion/consultar-ejercicios/consultar-ejercicios.caso-uso.js';
import { ListarEjercicios } from '../../aplicacion/listar-ejercicios/listar-ejercicios.caso-uso.js';
import type { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
import { ConsultarEjerciciosDto } from '../consultar-ejercicios/consultar-ejercicios.dto.js';

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

/** Una página de la consulta de ejercicios. `pagina` arranca en 1. */
export interface PaginaEjerciciosRespuesta {
  items: EjercicioRespuesta[];
  total: number;
  pagina: number;
  tamanio: number;
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
  constructor(
    @Inject(ListarEjercicios) private readonly listar: ListarEjercicios,
    @Inject(ConsultarEjercicios) private readonly consultar: ConsultarEjercicios,
  ) {}

  /** Admin y Profesor (RN-IDE-03). Lo usan la lista de ejercicios y, en US06, el editor de rutinas. */
  @Get('ejercicios')
  @Roles('Admin', 'Profesor')
  async ejercicios(): Promise<EjercicioRespuesta[]> {
    return (await this.listar.ejecutar()).map(aRespuesta);
  }

  /** Admin y Profesor (RN-IDE-03). T06 y T07: consulta paginada con buscador y filtros; tamaño por defecto 20. */
  @Get('ejercicios/consulta')
  @Roles('Admin', 'Profesor')
  async consulta(@Query() consulta: ConsultarEjerciciosDto): Promise<PaginaEjerciciosRespuesta> {
    const { busqueda, grupo, musculo, tipo, tipoCarga, pagina, tamanio } = consulta;
    const resultado = await this.consultar.ejecutar(
      { busqueda, grupoMuscular: grupo, musculo, tipo, tipoCarga },
      pagina ?? 1,
      tamanio ?? 20,
    );
    return { ...resultado, items: resultado.items.map(aRespuesta) };
  }
}
