import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

export type GrupoMuscular =
  'Piernas' | 'Pecho' | 'Espalda' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio';

/** RN-CAT-05: lista cerrada de músculos y grupo muscular al que pertenece cada uno. */
const GRUPO_DE_CADA_MUSCULO: Readonly<Record<string, GrupoMuscular>> = {
  Cuádriceps: 'Piernas',
  Isquiotibiales: 'Piernas',
  Glúteos: 'Piernas',
  Gemelos: 'Piernas',
  Sóleo: 'Piernas',
  Aductores: 'Piernas',
  Abductores: 'Piernas',
  Pectoral: 'Pecho',
  Serrato: 'Pecho',
  Dorsal: 'Espalda',
  Trapecio: 'Espalda',
  Lumbar: 'Espalda',
  'Elevador de la escápula': 'Espalda',
  Deltoides: 'Hombros',
  Bíceps: 'Brazos',
  Tríceps: 'Brazos',
  Antebrazo: 'Brazos',
  Abdominales: 'Core',
  Oblicuos: 'Core',
  Cardiovascular: 'Cardio',
};

/** RN-CAT-05: los músculos de la lista cerrada. */
export const NOMBRES_MUSCULOS: readonly string[] = Object.keys(GRUPO_DE_CADA_MUSCULO);

/** RN-CAT-05: los grupos musculares. */
export const GRUPOS_MUSCULARES: readonly GrupoMuscular[] = [
  ...new Set(Object.values(GRUPO_DE_CADA_MUSCULO)),
];

/** RN-CAT-05: los músculos que pertenecen a un grupo muscular (vacío si el grupo no existe). */
export const musculosDelGrupo = (grupo: string): string[] =>
  Object.entries(GRUPO_DE_CADA_MUSCULO)
    .filter(([, delGrupo]) => delGrupo === grupo)
    .map(([nombre]) => nombre);

export class Musculo {
  private constructor(
    readonly nombre: string,
    readonly grupo: GrupoMuscular,
  ) {}

  static desde(nombre: string): Musculo {
    const grupo = Object.hasOwn(GRUPO_DE_CADA_MUSCULO, nombre)
      ? GRUPO_DE_CADA_MUSCULO[nombre]
      : undefined;
    if (!grupo) {
      throw new ErrorDominio(
        'RN-CAT-05',
        `El músculo "${nombre}" no está en la lista de músculos del catálogo`,
      );
    }
    return new Musculo(nombre, grupo);
  }
}
