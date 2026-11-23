import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type {
  DatosEjercicioResumen,
  TipoCargaResumen,
} from './consulta-ejercicios-resumen.puerto.js';
import type { DatosEntrenamiento } from './entrenamiento.entidad.js';
import type { ResumenEntrenamiento } from './resumen-entrenamiento.js';

type EstrategiaCarga = (corporal: number, extra: number) => number;
const CARGAS: Record<TipoCargaResumen, EstrategiaCarga> = {
  'Sin Peso': () => 0,
  'Peso Extra': (_corporal, extra) => extra,
  'Peso Corporal': (corporal) => corporal,
  'Peso Corporal + Peso Extra': (corporal, extra) => corporal + extra,
};

/** RN-ENT-06 a 09: volumen de las series realizadas y grupos musculares sin repetir. */
export function calcularResumen(
  datos: DatosEntrenamiento,
  ahora: Date,
  catalogo: ReadonlyMap<string, DatosEjercicioResumen | null>,
): ResumenEntrenamiento {
  let volumenKg = 0;
  const grupos = new Set<string>();
  for (const serie of datos.series) {
    const ejercicio = catalogo.get(serie.ejercicioId);
    if (!ejercicio)
      throw new ErrorDominio(
        'RN-ENT-09',
        'No se encontró un ejercicio del entrenamiento',
        'no-encontrado',
      );
    if (
      (ejercicio.tipoCarga === 'Peso Corporal' ||
        ejercicio.tipoCarga === 'Peso Corporal + Peso Extra') &&
      ejercicio.factorPesoCorporal === null
    )
      throw new ErrorDominio(
        'RN-ENT-07',
        'Falta el factor de peso corporal del ejercicio',
        'validacion',
      );
    const corporal = (datos.pesoCorporalKg * (ejercicio.factorPesoCorporal ?? 0)) / 100;
    volumenKg +=
      CARGAS[ejercicio.tipoCarga](corporal, serie.realizada.pesoKg ?? 0) *
      (serie.realizada.repeticiones ?? 0);
    grupos.add(ejercicio.grupoPrincipal);
    if (ejercicio.grupoSecundario) grupos.add(ejercicio.grupoSecundario);
  }
  return {
    volumenKg,
    duracionSegundos: Math.floor((ahora.getTime() - Date.parse(datos.inicio)) / 1000),
    gruposMusculares: [...grupos],
  };
}
