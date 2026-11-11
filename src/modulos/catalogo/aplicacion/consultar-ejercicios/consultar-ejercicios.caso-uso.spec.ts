import { describe, expect, it } from 'vitest';
import { Ejercicio } from '../../dominio/ejercicio/ejercicio.entidad.js';
import { RepositorioEjercicios } from '../../dominio/ejercicio/repositorio-ejercicios.puerto.js';
import { Musculo } from '../../dominio/musculo/musculo.valor.js';
import { TipoCarga } from '../../dominio/tipo-carga/tipo-carga.valor.js';
import { TipoEjercicio } from '../../dominio/tipo-ejercicio/tipo-ejercicio.valor.js';
import { ConsultarEjercicios } from './consultar-ejercicios.caso-uso.js';

/**
 * Repositorio en memoria. No redefine `consultar`: usa la implementación por defecto
 * de la clase abstracta (filtra `listar()` en memoria).
 */
class RepositorioEnMemoria extends RepositorioEjercicios {
  readonly ejercicios: Ejercicio[] = [];
  async guardar(ejercicio: Ejercicio): Promise<void> {
    this.ejercicios.push(ejercicio);
  }
  async existePorIdDataset(idDataset: string): Promise<boolean> {
    return this.ejercicios.some((e) => e.idDataset === idDataset);
  }
  async existePorNombre(nombre: string): Promise<boolean> {
    return this.ejercicios.some((e) => e.nombre === nombre);
  }
  async listar(): Promise<Ejercicio[]> {
    return [...this.ejercicios];
  }
}

const ejercicio = (
  idDataset: string,
  nombre: string,
  tipo: string,
  tipoCarga: string,
  musculo: string,
): Ejercicio =>
  Ejercicio.crear({
    idDataset,
    nombre,
    descripcion: 'Descripción de prueba.',
    tipo: TipoEjercicio.desde(tipo),
    tipoCarga: TipoCarga.desde(tipoCarga),
    musculoPrincipal: Musculo.desde(musculo),
    urlGif: `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/${idDataset}.gif`,
    atribucion: '© Gym visual — https://gymvisual.com/',
  });

/**
 * Catálogo de prueba: 26 ejercicios, cargados en desorden a propósito para que el orden
 * alfabético sea una aserción real. Columnas: nombre, tipo, tipo de carga, músculo principal.
 */
const CATALOGO: [string, string, string, string][] = [
  ['Abdominal crunch', 'por repeticiones', 'Peso Corporal', 'Abdominales'],
  ['Bench press', 'por repeticiones', 'Peso Extra', 'Pectoral'],
  ['Biceps curl con barra', 'por repeticiones', 'Peso Extra', 'Bíceps'],
  ['Burpee', 'por repeticiones', 'Peso Corporal', 'Cuádriceps'],
  ['Cinta de correr', 'por tiempo', 'Sin Peso', 'Cardiovascular'],
  ['Dominadas', 'por repeticiones', 'Peso Corporal', 'Dorsal'],
  ['Elevaciones laterales', 'por repeticiones', 'Peso Extra', 'Deltoides'],
  ['Encogimientos con mancuernas', 'por repeticiones', 'Peso Extra', 'Trapecio'],
  ['Extensiones de tríceps', 'por repeticiones', 'Peso Extra', 'Tríceps'],
  ['Flexiones de brazos', 'por repeticiones', 'Peso Corporal', 'Pectoral'],
  ['Hip thrust', 'por repeticiones', 'Peso Extra', 'Glúteos'],
  ['Plancha frontal', 'por tiempo', 'Peso Corporal', 'Abdominales'],
  ['Plancha lateral con peso', 'por tiempo', 'Peso Corporal + Peso Extra', 'Oblicuos'],
  ['Press militar', 'por repeticiones', 'Peso Extra', 'Deltoides'],
  ['Press de banca inclinado', 'por repeticiones', 'Peso Extra', 'Pectoral'],
  ['Press de piernas', 'por repeticiones', 'Peso Extra', 'Cuádriceps'],
  ['Remo con barra', 'por repeticiones', 'Peso Extra', 'Dorsal'],
  ['Peso muerto rumano', 'por repeticiones', 'Peso Extra', 'Isquiotibiales'],
  ['Sentadilla libre', 'por repeticiones', 'Peso Corporal + Peso Extra', 'Cuádriceps'],
  ['Bicicleta fija', 'por tiempo', 'Sin Peso', 'Cardiovascular'],
  ['Elevar talones de pie', 'por repeticiones', 'Peso Corporal', 'Gemelos'],
  ['Fondos en paralelas', 'por repeticiones', 'Peso Corporal', 'Tríceps'],
  ['Abducciones con banda', 'por repeticiones', 'Sin Peso', 'Abductores'],
  ['Curl femoral', 'por repeticiones', 'Peso Extra', 'Isquiotibiales'],
  ['Vuelos posteriores con mancuernas', 'por repeticiones', 'Peso Extra', 'Deltoides'],
  ['Press de pecho en el suelo', 'por repeticiones', 'Peso Corporal', 'Pectoral'],
];

const repositorioConCatalogo = async (): Promise<RepositorioEnMemoria> => {
  const repositorio = new RepositorioEnMemoria();
  for (const [indice, [nombre, tipo, tipoCarga, musculo]] of CATALOGO.entries()) {
    await repositorio.guardar(
      ejercicio(String(indice + 1).padStart(4, '0'), nombre, tipo, tipoCarga, musculo),
    );
  }
  return repositorio;
};

const nombres = (resultado: { items: Ejercicio[] }): string[] =>
  resultado.items.map((e) => e.nombre);

describe('T06 · la consulta pagina: con tamanio 20 devuelve 20 ejercicios ordenados por nombre y el total del catálogo', () => {
  it('sin filtros, tamanio 20: 20 items ordenados por nombre ascendente', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      {},
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Abdominal crunch',
      'Abducciones con banda',
      'Bench press',
      'Biceps curl con barra',
      'Bicicleta fija',
      'Burpee',
      'Cinta de correr',
      'Curl femoral',
      'Dominadas',
      'Elevaciones laterales',
      'Elevar talones de pie',
      'Encogimientos con mancuernas',
      'Extensiones de tríceps',
      'Flexiones de brazos',
      'Fondos en paralelas',
      'Hip thrust',
      'Peso muerto rumano',
      'Plancha frontal',
      'Plancha lateral con peso',
      'Press de banca inclinado',
    ]);
  });

  it('sin filtros, tamanio 20: el total es la cantidad de ejercicios del catálogo (26)', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      {},
      1,
      20,
    );

    expect(resultado.total).toBe(26);
  });
});

describe('RN-UI-LIS-01 · el buscador filtra por nombre: el texto está contenido en el nombre, sin distinguir mayúsculas', () => {
  it('busqueda "PRESS" devuelve solo los nombres que contienen "press"', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { busqueda: 'PRESS' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Bench press',
      'Press de banca inclinado',
      'Press de pecho en el suelo',
      'Press de piernas',
      'Press militar',
    ]);
  });
});

describe('RN-CAT-05 · el grupo muscular filtra por los músculos de su grupo (Pecho: Pectoral y Serrato)', () => {
  it('grupoMuscular "Pecho" devuelve solo los ejercicios cuyo músculo principal es de Pecho', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { grupoMuscular: 'Pecho' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Bench press',
      'Flexiones de brazos',
      'Press de banca inclinado',
      'Press de pecho en el suelo',
    ]);
  });
});

describe('RN-CAT-05 · el músculo principal filtra por ese músculo exacto', () => {
  it('musculo "Deltoides" devuelve solo los ejercicios con Deltoides como músculo principal', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { musculo: 'Deltoides' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Elevaciones laterales',
      'Press militar',
      'Vuelos posteriores con mancuernas',
    ]);
  });
});

describe('RN-CAT-02 · el tipo de ejercicio filtra por "por tiempo" o "por repeticiones"', () => {
  it('tipo "por tiempo" devuelve solo los ejercicios por tiempo', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { tipo: 'por tiempo' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Bicicleta fija',
      'Cinta de correr',
      'Plancha frontal',
      'Plancha lateral con peso',
    ]);
  });
});

describe('RN-CAT-03 · el tipo de carga filtra por el tipo exacto (Peso Corporal no incluye Peso Corporal + Peso Extra)', () => {
  it('tipoCarga "Peso Corporal" devuelve solo los ejercicios con ese tipo de carga', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { tipoCarga: 'Peso Corporal' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual([
      'Abdominal crunch',
      'Burpee',
      'Dominadas',
      'Elevar talones de pie',
      'Flexiones de brazos',
      'Fondos en paralelas',
      'Plancha frontal',
      'Press de pecho en el suelo',
    ]);
  });
});

describe('RN-UI-LIS-02 · los filtros y el buscador se combinan (Y)', () => {
  it('busqueda "press" + grupoMuscular "Pecho" + tipoCarga "Peso Extra" devuelve solo los que cumplen los tres', async () => {
    const resultado = await new ConsultarEjercicios(await repositorioConCatalogo()).ejecutar(
      { busqueda: 'press', grupoMuscular: 'Pecho', tipoCarga: 'Peso Extra' },
      1,
      20,
    );

    expect(nombres(resultado)).toEqual(['Bench press', 'Press de banca inclinado']);
  });
});
