import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import type { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { ConsultaNombresEjercicios } from '../../dominio/rutina/consulta-nombres-ejercicios.puerto.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';

/** Un ejercicio prescripto con el nombre del catálogo ya resuelto (US08). */
export interface EjercicioDeLaRutinaRespuesta {
  ejercicioId: string;
  nombre: string;
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
}

/** Un bloque de la rutina del día (RN-PLAN-02). */
export interface BloqueDeLaRutinaRespuesta extends EjercicioDeLaRutinaRespuesta {
  series: number;
  micropausaSegundos: number;
  macropausaSegundos: number;
}

/** Un circuito de la rutina del día (RN-PLAN-03). */
export interface CircuitoDeLaRutinaRespuesta {
  vueltas: number;
  macropausaSegundos: number;
  ejercicios: EjercicioDeLaRutinaRespuesta[];
}

/** La rutina del día con los nombres de sus ejercicios. */
export interface RutinaDelDiaRespuesta {
  id: string;
  /** RN-PLAN-21. */
  nombre: string;
  tipo: string;
  bloques: BloqueDeLaRutinaRespuesta[];
  circuitos: CircuitoDeLaRutinaRespuesta[];
}

/**
 * US08, RN-PLAN-18: el alumno consulta la rutina del día de su plan vigente. La fecha sale del
 * `Reloj`. Unión discriminada por `estado` para que el front distinga los tres casos.
 */
export type ResultadoRutinaDelDia =
  | { estado: 'rutina'; fecha: string; numeroDia: number; rutina: RutinaDelDiaRespuesta }
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
      rutina: await this.aRespuesta(rutina),
    };
  }

  private async aRespuesta(rutina: Rutina): Promise<RutinaDelDiaRespuesta> {
    const ids = [
      ...rutina.bloques.map((bloque) => bloque.ejercicio.ejercicioId),
      ...rutina.circuitos.flatMap((circuito) =>
        circuito.ejercicios.map((ejercicio) => ejercicio.ejercicioId),
      ),
    ];
    const nombres = new Map(
      (await this.nombres.buscarPorIds(ids)).map(({ id, nombre }) => [id, nombre] as const),
    );
    const nombreDe = (ejercicioId: string): string => nombres.get(ejercicioId) ?? ejercicioId;

    return {
      id: rutina.id,
      nombre: rutina.nombre,
      tipo: rutina.tipo.valor,
      bloques: rutina.bloques.map((bloque) => ({
        ejercicioId: bloque.ejercicio.ejercicioId,
        nombre: nombreDe(bloque.ejercicio.ejercicioId),
        series: bloque.series,
        micropausaSegundos: bloque.micropausa.segundos,
        macropausaSegundos: bloque.macropausa.segundos,
        repeticiones: bloque.ejercicio.objetivo.repeticiones,
        segundos: bloque.ejercicio.objetivo.segundos,
        pesoKg: bloque.ejercicio.objetivo.pesoKg,
      })),
      circuitos: rutina.circuitos.map((circuito) => ({
        vueltas: circuito.vueltas,
        macropausaSegundos: circuito.macropausa.segundos,
        ejercicios: circuito.ejercicios.map((ejercicio) => ({
          ejercicioId: ejercicio.ejercicioId,
          nombre: nombreDe(ejercicio.ejercicioId),
          repeticiones: ejercicio.objetivo.repeticiones,
          segundos: ejercicio.objetivo.segundos,
          pesoKg: ejercicio.objetivo.pesoKg,
        })),
      })),
    };
  }
}
