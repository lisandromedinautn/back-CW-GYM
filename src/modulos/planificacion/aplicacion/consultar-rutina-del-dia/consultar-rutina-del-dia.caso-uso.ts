import {
  resolverRutinaParaAlumno,
  type RutinaParaAlumnoRespuesta,
} from '../consultar-rutinas/resolver-rutina-para-alumno.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import type { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { ConsultaNombresEjercicios } from '../../dominio/rutina/consulta-nombres-ejercicios.puerto.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';

/**
 * US08, RN-PLAN-18: el alumno consulta la rutina del día de su plan vigente. La fecha sale del
 * `Reloj`. Unión discriminada por `estado` para que el front distinga los tres casos.
 */
export type ResultadoRutinaDelDia =
  | { estado: 'rutina'; fecha: string; numeroDia: number; rutina: RutinaParaAlumnoRespuesta }
  | { estado: 'descanso'; fecha: string; numeroDia: number }
  | { estado: 'sin-plan'; fecha: string };

/**
 * US08. Resuelve el plan vigente del alumno con la fecha del `Reloj` (RN-PLAN-15), el día que
 * corresponde a esa fecha (RN-PLAN-11) y su rutina o descanso (RN-PLAN-10, 18). Los nombres de
 * los ejercicios se resuelven por el puerto `ConsultaNombresEjercicios` (US08).
 */
export class ConsultarRutinaDelDia {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly rutinas: RepositorioRutinas,
    private readonly vinculos: ConsultaVinculos,
    private readonly nombres: ConsultaNombresEjercicios,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(usuarioId: string): Promise<ResultadoRutinaDelDia> {
    const fecha = fechaIso(this.reloj.ahora());

    const alumnoId = await this.vinculos.obtenerAlumnoIdPorUsuarioId(usuarioId);
    if (alumnoId === null) return { estado: 'sin-plan', fecha };

    const [plan] = await this.planes.listarVigentesPorAlumno(alumnoId, fecha);
    if (!plan) return { estado: 'sin-plan', fecha };

    const dia = plan.diaPorFecha(fecha);
    if (!dia) return { estado: 'sin-plan', fecha };

    // RN-PLAN-10: sin rutina asignada, el día es de descanso.
    const rutinaId = dia.rutinaId;
    if (rutinaId === null) return { estado: 'descanso', fecha, numeroDia: dia.numero };

    const rutina = await this.rutinas.buscarPorId(rutinaId);
    if (!rutina) {
      throw new ErrorDominio('RN-PLAN-08', 'La rutina del día no existe', 'no-encontrado');
    }

    return {
      estado: 'rutina',
      fecha,
      numeroDia: dia.numero,
      rutina: await resolverRutinaParaAlumno(rutina, this.nombres),
    };
  }
}
