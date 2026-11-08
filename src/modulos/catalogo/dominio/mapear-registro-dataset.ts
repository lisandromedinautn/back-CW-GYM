import { ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import { Ejercicio } from './ejercicio.js';
import { Musculo } from './musculo.js';
import type { RegistroDataset } from './registro-dataset.js';
import { TipoCarga } from './tipo-carga.js';
import { TipoEjercicio } from './tipo-ejercicio.js';

/** RN-CAT-08: URL base de la media del dataset (solo se enlaza, no se copia). */
const URL_BASE_MEDIA = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

const CARGA_POR_EQUIPAMIENTO: Readonly<Record<string, TipoCarga>> = {
  'body weight': TipoCarga.PESO_CORPORAL,
  assisted: TipoCarga.PESO_CORPORAL,
  weighted: TipoCarga.PESO_CORPORAL_Y_EXTRA,
  'stationary bike': TipoCarga.SIN_PESO,
  'elliptical machine': TipoCarga.SIN_PESO,
  'stepmill machine': TipoCarga.SIN_PESO,
  'skierg machine': TipoCarga.SIN_PESO,
  'upper body ergometer': TipoCarga.SIN_PESO,
  roller: TipoCarga.SIN_PESO,
  'wheel roller': TipoCarga.SIN_PESO,
  band: TipoCarga.SIN_PESO,
  'resistance band': TipoCarga.SIN_PESO,
  'stability ball': TipoCarga.SIN_PESO,
  'bosu ball': TipoCarga.SIN_PESO,
};

const MUSCULO_PRINCIPAL_POR_TARGET: Readonly<Record<string, string>> = {
  abs: 'Abdominales',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  glutes: 'Glúteos',
  calves: 'Gemelos',
  adductors: 'Aductores',
  abductors: 'Abductores',
  pectorals: 'Pectoral',
  'serratus anterior': 'Serrato',
  lats: 'Dorsal',
  'upper back': 'Trapecio',
  traps: 'Trapecio',
  spine: 'Lumbar',
  'levator scapulae': 'Elevador de la escápula',
  delts: 'Deltoides',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazo',
  'cardiovascular system': 'Cardiovascular',
};

/** Los que no figuran acá (hip flexors, ankles, feet, shins, etc.) se ignoran. */
const MUSCULO_SECUNDARIO_POR_NOMBRE: Readonly<Record<string, string>> = {
  shoulders: 'Deltoides',
  deltoids: 'Deltoides',
  'rear deltoids': 'Deltoides',
  'rotator cuff': 'Deltoides',
  hamstrings: 'Isquiotibiales',
  forearms: 'Antebrazo',
  wrists: 'Antebrazo',
  'wrist flexors': 'Antebrazo',
  'wrist extensors': 'Antebrazo',
  'grip muscles': 'Antebrazo',
  hands: 'Antebrazo',
  brachialis: 'Bíceps',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Cuádriceps',
  calves: 'Gemelos',
  soleus: 'Sóleo',
  glutes: 'Glúteos',
  core: 'Abdominales',
  abdominals: 'Abdominales',
  'lower abs': 'Abdominales',
  obliques: 'Oblicuos',
  chest: 'Pectoral',
  'upper chest': 'Pectoral',
  'lower back': 'Lumbar',
  rhomboids: 'Trapecio',
  trapezius: 'Trapecio',
  traps: 'Trapecio',
  'upper back': 'Trapecio',
  back: 'Dorsal',
  'latissimus dorsi': 'Dorsal',
  lats: 'Dorsal',
  'inner thighs': 'Aductores',
  groin: 'Aductores',
};

function tipoDeEjercicio(registro: RegistroDataset): TipoEjercicio {
  const nombre = registro.name.toLowerCase();
  const esPorTiempo =
    registro.category === 'cardio' || nombre.endsWith('plank') || nombre.includes('isometric');
  return esPorTiempo ? TipoEjercicio.POR_TIEMPO : TipoEjercicio.POR_REPETICIONES;
}

function musculoPrincipal(registro: RegistroDataset): Musculo {
  const nombre = Object.hasOwn(MUSCULO_PRINCIPAL_POR_TARGET, registro.target)
    ? MUSCULO_PRINCIPAL_POR_TARGET[registro.target]
    : undefined;
  if (!nombre) {
    throw new ErrorDominio(
      'RN-CAT-08',
      `El target "${registro.target}" del ejercicio ${registro.id} no figura en el mapeo del dataset`,
    );
  }
  return Musculo.desde(nombre);
}

function musculoSecundario(registro: RegistroDataset, principal: Musculo): Musculo | null {
  for (const original of registro.secondary_muscles) {
    const nombre = Object.hasOwn(MUSCULO_SECUNDARIO_POR_NOMBRE, original)
      ? MUSCULO_SECUNDARIO_POR_NOMBRE[original]
      : undefined;
    if (nombre && nombre !== principal.nombre) return Musculo.desde(nombre);
  }
  return null;
}

/** RN-CAT-08: traduce un registro del dataset al modelo según la tabla "Mapeo del dataset". */
export function mapearRegistroDataset(registro: RegistroDataset): Ejercicio {
  const principal = musculoPrincipal(registro);
  const tipoCarga = Object.hasOwn(CARGA_POR_EQUIPAMIENTO, registro.equipment)
    ? CARGA_POR_EQUIPAMIENTO[registro.equipment]
    : TipoCarga.PESO_EXTRA;
  return Ejercicio.crear({
    idDataset: registro.id,
    nombre: registro.name,
    descripcion: registro.instrucciones,
    tipo: tipoDeEjercicio(registro),
    tipoCarga,
    musculoPrincipal: principal,
    musculoSecundario: musculoSecundario(registro, principal),
    urlGif: URL_BASE_MEDIA + registro.gif_url,
    atribucion: registro.attribution,
  });
}
