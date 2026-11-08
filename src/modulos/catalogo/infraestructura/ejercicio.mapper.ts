import { Ejercicio } from '../dominio/ejercicio/ejercicio.entidad.js';
import { FactorPesoCorporal } from '../dominio/factor-peso-corporal/factor-peso-corporal.valor.js';
import { Musculo } from '../dominio/musculo/musculo.valor.js';
import { TipoCarga } from '../dominio/tipo-carga/tipo-carga.valor.js';
import { TipoEjercicio } from '../dominio/tipo-ejercicio/tipo-ejercicio.valor.js';
import { EjercicioEsquema } from './ejercicio.esquema.js';

export const EjercicioMapper = {
  aEsquema(ejercicio: Ejercicio): EjercicioEsquema {
    const esquema = new EjercicioEsquema();
    esquema.id = ejercicio.id;
    esquema.idDataset = ejercicio.idDataset;
    esquema.nombre = ejercicio.nombre;
    esquema.descripcion = ejercicio.descripcion;
    esquema.tipo = ejercicio.tipo.valor;
    esquema.tipoCarga = ejercicio.tipoCarga.valor;
    esquema.factorPesoCorporal = ejercicio.factorPesoCorporal?.porcentaje ?? null;
    esquema.musculoPrincipal = ejercicio.musculoPrincipal.nombre;
    esquema.musculoSecundario = ejercicio.musculoSecundario?.nombre ?? null;
    esquema.urlGif = ejercicio.urlGif;
    esquema.atribucion = ejercicio.atribucion;
    return esquema;
  },

  aDominio(esquema: EjercicioEsquema): Ejercicio {
    return Ejercicio.reconstruir(esquema.id, {
      idDataset: esquema.idDataset,
      nombre: esquema.nombre,
      descripcion: esquema.descripcion,
      tipo: TipoEjercicio.desde(esquema.tipo),
      tipoCarga: TipoCarga.desde(esquema.tipoCarga),
      factorPesoCorporal:
        esquema.factorPesoCorporal === null
          ? null
          : FactorPesoCorporal.crear(esquema.factorPesoCorporal),
      musculoPrincipal: Musculo.desde(esquema.musculoPrincipal),
      musculoSecundario:
        esquema.musculoSecundario === null ? null : Musculo.desde(esquema.musculoSecundario),
      urlGif: esquema.urlGif,
      atribucion: esquema.atribucion,
    });
  },
};
