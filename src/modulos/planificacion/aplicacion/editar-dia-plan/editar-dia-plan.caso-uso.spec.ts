import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  RelojFijo,
  RepositorioPlanesEnMemoria,
  RepositorioRutinasEnMemoria,
} from '../../../../../test/dobles/planificacion.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';
import { ConsultaEntrenamientosIniciados } from '../../dominio/plan/consulta-entrenamientos-iniciados.puerto.js';
import { Plan } from '../../dominio/plan/plan.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { EditarDiaPlan } from './editar-dia-plan.caso-uso.js';

// Casos de US22 (Lisandro, 24/11/2026). Reloj fijo en 24/11/2026: día 4 del plan = hoy.
const HOY = '2026-11-24';

/** Fake en memoria: los pares alumno-fecha en los que hay un Entrenamiento iniciado. */
class EntrenamientosIniciadosFalsos extends ConsultaEntrenamientosIniciados {
  constructor(private readonly iniciados: { alumnoId: string; fecha: string }[] = []) {
    super();
  }

  async hayIniciadoEn(alumnoIds: string[], fecha: string): Promise<boolean> {
    return this.iniciados.some(
      (iniciado) => alumnoIds.includes(iniciado.alumnoId) && iniciado.fecha === fecha,
    );
  }
}

const dias = (rutinaId: string | null = null) =>
  Array.from({ length: 28 }, (_, indice) => ({ numero: indice + 1, rutinaId }));

const capturarError = (accion: () => Promise<unknown>): Promise<unknown> =>
  accion().then(
    () => undefined,
    (error: unknown) => error,
  );

const diaDel = (plan: Plan, numero: number) => plan.dias.find((dia) => dia.numero === numero);

describe('RN-PLAN-23 · el profesor cambia la rutina de un día de su plan', () => {
  let planes: RepositorioPlanesEnMemoria;
  let rutinas: RepositorioRutinasEnMemoria;
  let entrenamientos: EntrenamientosIniciadosFalsos;
  let editarDiaPlan: EditarDiaPlan;
  let rutinaPropia: string;
  let rutinaAjena: string;
  let plan: Plan;

  const guardarRutina = async (profesorUsuarioId: string, nombre: string): Promise<string> => {
    const id = randomUUID();
    await rutinas.guardar(Rutina.reconstruir(id, profesorUsuarioId, [], [], nombre));
    return id;
  };

  beforeEach(async () => {
    planes = new RepositorioPlanesEnMemoria();
    rutinas = new RepositorioRutinasEnMemoria();
    entrenamientos = new EntrenamientosIniciadosFalsos();
    editarDiaPlan = new EditarDiaPlan(
      planes,
      rutinas,
      entrenamientos,
      new RelojFijo(new Date(`${HOY}T00:00:00Z`)),
    );
    rutinaPropia = await guardarRutina('u-laura', 'Pecho');
    rutinaAjena = await guardarRutina('u-diego', 'Pecho');
    plan = Plan.crear({
      profesorUsuarioId: 'u-laura',
      fechaInicio: '2026-11-21',
      dias: dias(),
      alumnoIds: ['a1'],
    });
    await planes.guardar(plan);
  });

  it('C1 una rutina ajena se rechaza como no encontrada y no guarda el día', async () => {
    const error = await capturarError(() =>
      editarDiaPlan.ejecutar('u-laura', plan.id, 10, rutinaAjena),
    );

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-23',
      'no-encontrado',
    ]);
    expect(diaDel((await planes.buscarPorId(plan.id)) as Plan, 10)?.rutinaId).toBeNull();
  });

  it('C2 un plan de otro profesor se rechaza como no encontrado y no se guarda', async () => {
    const planAjeno = Plan.crear({
      profesorUsuarioId: 'u-diego',
      fechaInicio: '2026-11-21',
      dias: dias(),
      alumnoIds: ['a2'],
    });
    await planes.guardar(planAjeno);

    const error = await capturarError(() =>
      editarDiaPlan.ejecutar('u-laura', planAjeno.id, 10, rutinaPropia),
    );

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-23',
      'no-encontrado',
    ]);
    expect(diaDel((await planes.buscarPorId(planAjeno.id)) as Plan, 10)?.rutinaId).toBeNull();
  });

  it('C2 un plan inexistente se rechaza como no encontrado', async () => {
    const error = await capturarError(() =>
      editarDiaPlan.ejecutar('u-laura', randomUUID(), 10, rutinaPropia),
    );

    expect(error instanceof ErrorDominio ? error.categoria : error).toBe('no-encontrado');
  });

  it('C3 hoy con un entrenamiento iniciado por un alumno del plan se rechaza con conflicto y no guarda', async () => {
    entrenamientos = new EntrenamientosIniciadosFalsos([{ alumnoId: 'a1', fecha: HOY }]);
    editarDiaPlan = new EditarDiaPlan(
      planes,
      rutinas,
      entrenamientos,
      new RelojFijo(new Date(`${HOY}T00:00:00Z`)),
    );

    const error = await capturarError(() =>
      editarDiaPlan.ejecutar('u-laura', plan.id, 4, rutinaPropia),
    );

    expect(error instanceof ErrorDominio ? [error.codigo, error.categoria] : error).toEqual([
      'RN-PLAN-23',
      'conflicto',
    ]);
    expect(diaDel((await planes.buscarPorId(plan.id)) as Plan, 4)?.rutinaId).toBeNull();
  });
});
