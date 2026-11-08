import { describe, expect, it } from 'vitest';
import { Ejercicio } from '../dominio/ejercicio.js';
import { FactorPesoCorporal } from '../dominio/factor-peso-corporal.js';
import { Musculo } from '../dominio/musculo.js';
import { TipoCarga } from '../dominio/tipo-carga.js';
import { TipoEjercicio } from '../dominio/tipo-ejercicio.js';
import { EjercicioMapper } from './ejercicio.mapper.js';

const datos = {
  idDataset: '0577',
  nombre: 'lever chest press',
  descripcion: 'Sentate en la máquina.',
  tipo: TipoEjercicio.POR_REPETICIONES,
  tipoCarga: TipoCarga.PESO_CORPORAL_Y_EXTRA,
  factorPesoCorporal: FactorPesoCorporal.crear(75),
  musculoPrincipal: Musculo.desde('Pectoral'),
  musculoSecundario: Musculo.desde('Tríceps'),
  urlGif: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0577.gif',
  atribucion: '© Gym visual — https://gymvisual.com/',
};

describe('T01 · el mapper traduce entre el ejercicio de dominio y el esquema de TypeORM', () => {
  it('un ejercicio con todos los campos vuelve igual del esquema', () => {
    const original = Ejercicio.crear(datos);

    const vuelto = EjercicioMapper.aDominio(EjercicioMapper.aEsquema(original));

    expect(vuelto).toEqual(original);
  });

  it('un ejercicio sin factor ni secundario guarda null en el esquema', () => {
    const original = Ejercicio.crear({
      ...datos,
      tipoCarga: TipoCarga.PESO_EXTRA,
      musculoSecundario: null,
    });

    const esquema = EjercicioMapper.aEsquema(original);

    expect([esquema.factorPesoCorporal, esquema.musculoSecundario]).toEqual([null, null]);
    expect(EjercicioMapper.aDominio(esquema)).toEqual(original);
  });
});
