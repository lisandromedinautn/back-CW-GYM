import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConsultaEntrenamientosIniciados } from '../../dominio/plan/consulta-entrenamientos-iniciados.puerto.js';

/**
 * RN-PLAN-23. Lee la tabla `entrenamientos` con SQL parametrizado: importar el módulo de
 * Entrenamiento crearía un ciclo (Entrenamiento ya depende de Planificación).
 */
@Injectable()
export class ConsultaEntrenamientosIniciadosTypeorm extends ConsultaEntrenamientosIniciados {
  constructor(@InjectDataSource() private readonly fuente: DataSource) {
    super();
  }

  async hayIniciadoEn(alumnoIds: string[], fecha: string): Promise<boolean> {
    if (alumnoIds.length === 0) return false;
    const filas: unknown[] = await this.fuente.query(
      'SELECT 1 FROM entrenamientos WHERE alumno_id = ANY($1::uuid[]) AND fecha = $2 LIMIT 1',
      [alumnoIds, fecha],
    );
    return filas.length > 0;
  }
}
