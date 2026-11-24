import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { RecordPersonal } from '../../dominio/record-personal/record-personal.entidad.js';
import { RepositorioRecords } from '../../dominio/record-personal/repositorio-records.puerto.js';
import { RecordPersonalEsquema } from './record-personal.esquema.js';
import { filaARecord, recordAFila } from './record-personal.mapper.js';

@Injectable()
export class RepositorioRecordsTypeorm implements RepositorioRecords {
  constructor(
    @InjectRepository(RecordPersonalEsquema)
    private readonly filas: Repository<RecordPersonalEsquema>,
  ) {}

  async buscarPorAlumnoYEjercicios(
    alumnoId: string,
    ejercicioIds: string[],
  ): Promise<RecordPersonal[]> {
    if (ejercicioIds.length === 0) return [];
    const filas = await this.filas.find({
      where: { alumnoId, ejercicioId: In(ejercicioIds) },
    });
    return filas.map(filaARecord);
  }

  async guardar(records: RecordPersonal[]): Promise<void> {
    if (records.length === 0) return;
    const porClave = new Map<string, RecordPersonalEsquema>();
    for (const record of records) {
      const fila = recordAFila(record);
      porClave.set(`${fila.alumnoId}|${fila.ejercicioId}|${fila.tipo}`, fila);
    }
    await this.filas.upsert([...porClave.values()], ['alumnoId', 'ejercicioId', 'tipo']);
  }
}
