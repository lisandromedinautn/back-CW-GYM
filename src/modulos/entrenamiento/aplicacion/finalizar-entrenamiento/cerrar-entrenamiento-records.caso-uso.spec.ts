import { describe, expect, it, vi } from 'vitest';
import { RelojFijo } from '../../../../../test/dobles/planificacion.js';
import { RepositorioEntrenamientosEnMemoria } from '../../../../../test/dobles/entrenamiento.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { ConsultaEjerciciosResumen } from '../../dominio/entrenamiento/consulta-ejercicios-resumen.puerto.js';
import type { ConsultaEjerciciosRecords } from '../../dominio/entrenamiento/consulta-ejercicios-records.puerto.js';
import { RepositorioCierreEntrenamiento } from '../../dominio/entrenamiento/repositorio-cierre-entrenamiento.puerto.js';
import type { ResumenEntrenamiento } from '../../dominio/entrenamiento/resumen-entrenamiento.js';
import { MarcasPorTipoEjercicio } from '../../dominio/marcas-por-tipo-ejercicio/marcas-por-tipo-ejercicio.js';
import { DetectorRecords } from '../../dominio/record-personal/detector-records.js';
import { RecordPersonal } from '../../dominio/record-personal/record-personal.entidad.js';
import { RepositorioRecords } from '../../dominio/record-personal/repositorio-records.puerto.js';
import type { TipoRecord } from '../../dominio/record-personal/tipo-record.js';
import { CerrarEntrenamiento } from './cerrar-entrenamiento.caso-uso.js';
import { CerrarEntrenamientoConRecords } from './cerrar-entrenamiento-con-records.caso-uso.js';
import { FinalizarEntrenamiento } from './finalizar-entrenamiento.caso-uso.js';

const ALUMNO = 'alumno';
const EJERCICIO = 'sentadilla';
const INICIO = '2026-11-22T10:00:00.000Z';
const FIN = '2026-11-22T10:30:00.000Z';

class CierreEnMemoria extends RepositorioCierreEntrenamiento {
  constructor(private readonly repo: RepositorioEntrenamientosEnMemoria) {
    super();
  }
  async finalizarAtomico(
    id: string,
    instante: Date,
    calcular: (entrenamiento: Entrenamiento) => Promise<ResumenEntrenamiento>,
  ) {
    const entrenamiento = await this.repo.buscarPorId(id);
    if (!entrenamiento) return null;
    entrenamiento.asegurarFinalizable(instante);
    entrenamiento.finalizar(instante, await calcular(entrenamiento));
    return entrenamiento;
  }
}

class RepositorioRecordsEnMemoria extends RepositorioRecords {
  records: RecordPersonal[];

  constructor(records: RecordPersonal[] = []) {
    super();
    this.records = [...records];
  }

  async buscarPorAlumnoYEjercicios(
    alumnoId: string,
    ejercicioIds: string[],
  ): Promise<RecordPersonal[]> {
    return this.records.filter(
      (record) =>
        record.datos.alumnoId === alumnoId && ejercicioIds.includes(record.datos.ejercicioId),
    );
  }

  async guardar(records: RecordPersonal[]): Promise<void> {
    for (const record of records) {
      const indice = this.records.findIndex(
        (actual) =>
          actual.datos.alumnoId === record.datos.alumnoId &&
          actual.datos.ejercicioId === record.datos.ejercicioId &&
          actual.datos.tipo === record.datos.tipo,
      );
      if (indice === -1) this.records.push(record);
      else this.records[indice] = record;
    }
  }
}

class CatalogoResumenFalso implements ConsultaEjerciciosResumen {
  async obtenerEjercicio() {
    return {
      tipoCarga: 'Peso Extra' as const,
      factorPesoCorporal: null,
      grupoPrincipal: 'Pecho',
      grupoSecundario: 'Brazos',
    };
  }
}

class CatalogoRecordsFalso implements ConsultaEjerciciosRecords {
  async obtenerDatosParaRecords(id: string) {
    if (id !== EJERCICIO) return null;
    return {
      id,
      nombre: 'Sentadilla',
      tipo: 'por repeticiones' as const,
      tipoCarga: 'Peso Extra' as const,
      factorPesoCorporal: null,
    };
  }
}

function record(tipo: TipoRecord, valor: number, id: string): RecordPersonal {
  return RecordPersonal.reconstruir({
    id,
    alumnoId: ALUMNO,
    ejercicioId: EJERCICIO,
    tipo,
    valor,
    entrenamientoId: 'entrenamiento-anterior',
    fecha: '2026-11-20',
  });
}

async function preparar(
  series: { numero: number; repeticiones: number; pesoKg: number }[],
  previos: RecordPersonal[] = [],
) {
  const repo = new RepositorioEntrenamientosEnMemoria();
  const entrenamiento = Entrenamiento.crear({
    id: 'ent',
    alumnoId: ALUMNO,
    inicio: INICIO,
    pesoCorporalKg: 80,
    rutina: {
      id: 'rutina',
      nombre: 'Rutina',
      tipo: 'Bloques',
      bloques: [
        {
          orden: 1,
          ejercicioId: EJERCICIO,
          nombre: 'Sentadilla',
          repeticiones: 10,
          segundos: null,
          pesoKg: 30,
          series: 3,
          micropausaSegundos: 20,
          macropausaSegundos: 60,
        },
      ],
      circuitos: [],
    },
  });
  await repo.insertar(entrenamiento);
  for (const serie of series)
    entrenamiento.registrarSerie(
      {
        orden: 1,
        numero: serie.numero,
        repeticiones: serie.repeticiones,
        pesoKg: serie.pesoKg,
      },
      new Date('2026-11-22T10:10:00.000Z'),
    );

  const alumnos = { obtenerAlumnoConPeso: async () => ({ id: ALUMNO, pesoKg: 80 }) };
  const reloj = new RelojFijo(new Date(FIN));
  const publicar = vi
    .fn<(evento: { nombre: string }) => Promise<void>>()
    .mockResolvedValue(undefined);
  const calculo = new FinalizarEntrenamiento(repo, alumnos, new CatalogoResumenFalso(), reloj);
  const cerrar = new CerrarEntrenamiento(repo, new CierreEnMemoria(repo), alumnos, reloj, calculo, {
    publicar,
  });
  const records = new RepositorioRecordsEnMemoria(previos);
  const caso = new CerrarEntrenamientoConRecords(
    cerrar,
    repo,
    records,
    new CatalogoRecordsFalso(),
    new MarcasPorTipoEjercicio(),
    new DetectorRecords(),
    { publicar },
  );
  return { caso, records, publicar };
}

describe('RN-ENT-13 · detección y persistencia de récords al cerrar', () => {
  it('guarda la primera marca sin anunciarla', async () => {
    const { caso, records, publicar } = await preparar([
      { numero: 1, repeticiones: 8, pesoKg: 30 },
    ]);

    const resumen = await caso.ejecutar('usuario', 'ent');

    expect(resumen).toEqual({
      volumenKg: 240,
      duracionSegundos: 1800,
      gruposMusculares: ['Pecho', 'Brazos'],
    });
    expect(resumen).not.toHaveProperty('recordsBatidos');
    expect(records.records.map((r) => [r.datos.tipo, r.datos.valor])).toEqual([
      ['repeticiones', 8],
      ['volumen', 240],
      ['1rm', 38],
    ]);
    expect(publicar.mock.calls.map(([evento]) => evento.nombre)).toEqual([
      'EntrenamientoFinalizado',
    ]);
  });

  it('no guarda ni anuncia cuando la marca empata', async () => {
    const { caso, records, publicar } = await preparar(
      [{ numero: 1, repeticiones: 8, pesoKg: 30 }],
      [
        record('repeticiones', 8, 'r-rep'),
        record('volumen', 240, 'r-vol'),
        record('1rm', 38, 'r-1rm'),
      ],
    );

    const resumen = await caso.ejecutar('usuario', 'ent');

    expect(resumen).not.toHaveProperty('recordsBatidos');
    expect(records.records.map((r) => [r.datos.tipo, r.datos.valor])).toEqual([
      ['repeticiones', 8],
      ['volumen', 240],
      ['1rm', 38],
    ]);
    expect(publicar.mock.calls.map(([evento]) => evento.nombre)).toEqual([
      'EntrenamientoFinalizado',
    ]);
  });

  it('guarda la marca mayor con el mismo id y anuncia los tres tipos', async () => {
    const { caso, records, publicar } = await preparar(
      [{ numero: 1, repeticiones: 10, pesoKg: 30 }],
      [
        record('repeticiones', 8, 'r-rep'),
        record('volumen', 240, 'r-vol'),
        record('1rm', 38, 'r-1rm'),
      ],
    );

    const resumen = await caso.ejecutar('usuario', 'ent');

    expect(resumen).toMatchObject({
      volumenKg: 300,
      duracionSegundos: 1800,
      gruposMusculares: ['Pecho', 'Brazos'],
      recordsBatidos: [
        {
          ejercicioId: EJERCICIO,
          nombre: 'Sentadilla',
          tipo: 'repeticiones',
          valorAnterior: 8,
          valorNuevo: 10,
        },
        {
          ejercicioId: EJERCICIO,
          nombre: 'Sentadilla',
          tipo: 'volumen',
          valorAnterior: 240,
          valorNuevo: 300,
        },
        {
          ejercicioId: EJERCICIO,
          nombre: 'Sentadilla',
          tipo: '1rm',
          valorAnterior: 38,
          valorNuevo: 40,
        },
      ],
    });
    expect(records.records.map((r) => [r.datos.id, r.datos.valor])).toEqual([
      ['r-rep', 10],
      ['r-vol', 300],
      ['r-1rm', 40],
    ]);
    expect(publicar.mock.calls.map(([evento]) => evento.nombre)).toEqual([
      'EntrenamientoFinalizado',
      'RecordBatido',
      'RecordBatido',
      'RecordBatido',
    ]);
  });

  it('con varias series del mismo ejercicio guarda solo la mejor marca', async () => {
    const { caso, records, publicar } = await preparar([
      { numero: 1, repeticiones: 5, pesoKg: 30 },
      { numero: 2, repeticiones: 10, pesoKg: 30 },
    ]);

    const resumen = await caso.ejecutar('usuario', 'ent');

    expect(resumen).toMatchObject({ volumenKg: 450 });
    expect(resumen).not.toHaveProperty('recordsBatidos');
    expect(records.records.map((r) => [r.datos.tipo, r.datos.valor])).toEqual([
      ['repeticiones', 10],
      ['volumen', 300],
      ['1rm', 40],
    ]);
    expect(publicar.mock.calls.map(([evento]) => evento.nombre)).toEqual([
      'EntrenamientoFinalizado',
    ]);
  });
});
