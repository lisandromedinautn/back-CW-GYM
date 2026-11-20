import { randomUUID } from 'node:crypto';
import {
  CODIGO_NO_ENCONTRADO,
  ErrorDominio,
} from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { PublicadorEventos } from '../../../../compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type {
  ConsultaAlumno,
  ConsultaRutinaDelDia,
} from '../../dominio/entrenamiento/consultas-entrenamiento.puerto.js';
import { Entrenamiento } from '../../dominio/entrenamiento/entrenamiento.entidad.js';
import type { RepositorioEntrenamientos } from '../../dominio/entrenamiento/repositorio-entrenamientos.puerto.js';

export class IniciarEntrenamiento {
  constructor(
    private readonly entrenamientos: RepositorioEntrenamientos,
    private readonly alumnos: ConsultaAlumno,
    private readonly rutinas: ConsultaRutinaDelDia,
    private readonly reloj: Reloj,
    private readonly publicador: PublicadorEventos,
  ) {}

  async ejecutar(usuarioId: string) {
    const inicio = this.reloj.ahora().toISOString();
    const alumno = await this.alumnos.obtenerAlumnoConPeso(usuarioId);
    if (!alumno)
      throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'Alumno no encontrado', 'no-encontrado');

    const dia = await this.rutinas.consultarRutinaDelDia(alumno.id, inicio.slice(0, 10));
    if (dia.estado !== 'rutina') {
      throw new ErrorDominio(
        'RN-ENT-01',
        dia.estado === 'descanso' ? 'Hoy es día de descanso' : 'No tenés un plan vigente',
        'conflicto',
      );
    }
    const entrenamiento = Entrenamiento.crear({
      id: randomUUID(),
      alumnoId: alumno.id,
      inicio,
      pesoCorporalKg: alumno.pesoKg,
      rutina: dia.rutina,
    });
    if (!(await this.entrenamientos.insertar(entrenamiento))) {
      throw new ErrorDominio('RN-ENT-01', 'Ya iniciaste un entrenamiento hoy', 'conflicto');
    }
    await this.publicador.publicar(entrenamiento.eventoDeInicio());
    return entrenamiento.datos;
  }
}
