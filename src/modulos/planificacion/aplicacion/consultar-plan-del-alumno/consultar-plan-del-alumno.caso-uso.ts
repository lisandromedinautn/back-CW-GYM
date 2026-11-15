import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import type { Reloj } from '../../../../compartido/dominio/reloj/reloj.puerto.js';
import type { ConsultaVinculos } from '../../dominio/plan/consulta-vinculos.puerto.js';
import { fechaIso } from '../../dominio/plan/fechas.js';
import type { RepositorioPlanes } from '../../dominio/plan/repositorio-planes.puerto.js';
import type { ConsultaNombresEjercicios } from '../../dominio/rutina/consulta-nombres-ejercicios.puerto.js';
import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import {
  resolverRutinaParaAlumno,
  type RutinaParaAlumnoRespuesta,
} from '../consultar-rutinas/resolver-rutina-para-alumno.js';

export type ResultadoPlanDelAlumno =
  | { estado: 'sin-plan'; fecha: string }
  | {
      estado: 'plan';
      fecha: string;
      plan: {
        id: string;
        fechaInicio: string;
        fechaFin: string;
        dias: { numero: number; fecha: string; rutina: RutinaParaAlumnoRespuesta | null }[];
      };
    };

export class ConsultarPlanDelAlumno {
  constructor(
    private readonly planes: RepositorioPlanes,
    private readonly rutinas: RepositorioRutinas,
    private readonly vinculos: ConsultaVinculos,
    private readonly nombres: ConsultaNombresEjercicios,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(usuarioId: string): Promise<ResultadoPlanDelAlumno> {
    const fecha = fechaIso(this.reloj.ahora());
    const alumnoId = await this.vinculos.obtenerAlumnoIdPorUsuarioId(usuarioId);
    if (alumnoId === null) return { estado: 'sin-plan', fecha };

    const [plan] = await this.planes.listarVigentesPorAlumno(alumnoId, fecha);
    if (!plan) return { estado: 'sin-plan', fecha };

    const detalles = new Map<string, RutinaParaAlumnoRespuesta>();
    const rutinaIds = new Set(plan.dias.map((dia) => dia.rutinaId));
    await Promise.all(
      [...rutinaIds].map(async (rutinaId) => {
        if (rutinaId === null) return;
        const rutina = await this.rutinas.buscarPorId(rutinaId);
        if (!rutina) {
          throw new ErrorDominio('RN-PLAN-08', 'La rutina del plan no existe', 'no-encontrado');
        }
        detalles.set(rutinaId, await resolverRutinaParaAlumno(rutina, this.nombres));
      }),
    );

    return {
      estado: 'plan',
      fecha,
      plan: {
        id: plan.id,
        fechaInicio: plan.fechaInicio,
        fechaFin: plan.fechaFin,
        dias: [...plan.dias]
          .sort((a, b) => a.numero - b.numero)
          .map((dia) => ({
            numero: dia.numero,
            fecha: dia.fecha,
            rutina: dia.rutinaId === null ? null : (detalles.get(dia.rutinaId) ?? null),
          })),
      },
    };
  }
}
