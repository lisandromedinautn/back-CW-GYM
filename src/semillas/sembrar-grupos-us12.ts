import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AlumnoEsquema } from '../modulos/identidad/infraestructura/alumno/alumno.esquema.js';
import { ProfesorEsquema } from '../modulos/identidad/infraestructura/profesor/profesor.esquema.js';
import { UsuarioEsquema } from '../modulos/identidad/infraestructura/usuario/usuario.esquema.js';
import { Plan } from '../modulos/planificacion/dominio/plan/plan.entidad.js';
import { fechaIso } from '../modulos/planificacion/dominio/plan/fechas.js';
import { ValidezPlan } from '../modulos/planificacion/dominio/plan/validez-plan.valor.js';
import { PlanEsquema } from '../modulos/planificacion/infraestructura/plan/plan.esquema.js';
import { PlanMapper } from '../modulos/planificacion/infraestructura/plan/plan.mapper.js';

const id = (numero: number) => `12000000-0000-4000-8000-${String(numero).padStart(12, '0')}`;

/** Datos aislados para probar asignaciones de US12, sin reemplazar datos existentes. */
export class SembrarGruposUS12 {
  constructor(
    private readonly base: DataSource,
    private readonly fecha: Date,
    private readonly contrasenia: string,
  ) {}

  async ejecutar(): Promise<void> {
    if (!this.contrasenia) throw new Error('Falta SEMILLA_CONTRASENIA');
    const hash = await bcrypt.hash(this.contrasenia, 10);
    const inicio = fechaIso(this.fecha);
    const validez = ValidezPlan.crear(inicio);
    await this.base.transaction(async (manager) => {
      for (let grupo = 1; grupo <= 2; grupo += 1) {
        const profesorUsuarioId = id(grupo);
        const profesorId = id(200 + grupo);
        const emailProfesor = `us12-profesor0${grupo}@cwgym.test`;
        const usuarioProfesor = await manager.findOne(UsuarioEsquema, {
          where: [{ id: profesorUsuarioId }, { email: emailProfesor }],
        });
        if (
          usuarioProfesor &&
          (usuarioProfesor.id !== profesorUsuarioId ||
            usuarioProfesor.email !== emailProfesor ||
            usuarioProfesor.rol !== 'Profesor' ||
            !(await bcrypt.compare(this.contrasenia, usuarioProfesor.hashContrasenia)))
        ) {
          throw new Error(`Conflicto con la cuenta ${emailProfesor}; no se modificaron los datos`);
        }
        if (!usuarioProfesor)
          await manager.insert(UsuarioEsquema, {
            id: profesorUsuarioId,
            email: emailProfesor,
            rol: 'Profesor',
            hashContrasenia: hash,
          });
        const profesor = await manager.findOne(ProfesorEsquema, {
          where: [
            { id: profesorId },
            { usuarioId: profesorUsuarioId },
            { tipoDocumento: 'DNI', numeroDocumento: `3900010${grupo}` },
            { legajo: `US12-P0${grupo}` },
          ],
        });
        if (profesor && (profesor.id !== profesorId || profesor.usuarioId !== profesorUsuarioId))
          throw new Error(
            `Conflicto con el profesor ${emailProfesor}; no se modificaron los datos`,
          );
        if (!profesor)
          await manager.insert(ProfesorEsquema, {
            id: profesorId,
            usuarioId: profesorUsuarioId,
            nombre: grupo === 1 ? 'Ana' : 'Diego',
            apellido: 'Prueba',
            tipoDocumento: 'DNI',
            numeroDocumento: `3900010${grupo}`,
            legajo: `US12-P0${grupo}`,
            codigo: null,
          });
        for (let indice = 1; indice <= 2; indice += 1) {
          const numero = (grupo - 1) * 2 + indice;
          const usuarioId = id(10 + numero);
          const alumnoId = id(300 + numero);
          const email = `us12-alumno0${numero}@cwgym.test`;
          const usuario = await manager.findOne(UsuarioEsquema, {
            where: [{ id: usuarioId }, { email }],
          });
          if (
            usuario &&
            (usuario.id !== usuarioId ||
              usuario.email !== email ||
              usuario.rol !== 'Alumno' ||
              !(await bcrypt.compare(this.contrasenia, usuario.hashContrasenia)))
          )
            throw new Error(`Conflicto con la cuenta ${email}; no se modificaron los datos`);
          if (!usuario)
            await manager.insert(UsuarioEsquema, {
              id: usuarioId,
              email,
              rol: 'Alumno',
              hashContrasenia: hash,
            });
          const alumno = await manager.findOne(AlumnoEsquema, {
            where: [
              { id: alumnoId },
              { usuarioId },
              { tipoDocumento: 'DNI', numeroDocumento: `4900010${numero}` },
            ],
          });
          if (
            alumno &&
            (alumno.id !== alumnoId ||
              alumno.usuarioId !== usuarioId ||
              alumno.profesorId !== profesorId)
          )
            throw new Error(`Conflicto con el vínculo de ${email}; no se modificaron los datos`);
          if (!alumno)
            await manager.insert(AlumnoEsquema, {
              id: alumnoId,
              usuarioId,
              nombre: `Alumno ${numero}`,
              apellido: 'Prueba',
              domicilio: 'Córdoba',
              tipoDocumento: 'DNI',
              numeroDocumento: `4900010${numero}`,
              alturaCm: 170,
              pesoKg: 70,
              edad: 25,
              profesorId,
            });
        }
        const planId = id(100 + grupo);
        const existente = await manager.findOne(PlanEsquema, { where: { id: planId } });
        if (existente && existente.profesorUsuarioId !== profesorUsuarioId)
          throw new Error(`Conflicto con el plan de ${emailProfesor}; no se modificaron los datos`);
        if (existente && (inicio < existente.fechaInicio || inicio > existente.fechaFin))
          throw new Error(
            `El plan de ${emailProfesor} no está vigente; no se modificaron los datos`,
          );
        if (!existente) {
          const asignadoId = id(300 + (grupo - 1) * 2 + 1);
          await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
            asignadoId,
          ]);
          const conflictos = await manager.query(
            'SELECT 1 FROM plan_alumnos a JOIN planes p ON p.id = a.plan_id WHERE a.alumno_id = $1 AND p.fecha_inicio <= $2 AND p.fecha_fin >= $2 LIMIT 1',
            [asignadoId, inicio],
          );
          if (conflictos.length)
            throw new Error(
              `El alumno asignado a ${emailProfesor} ya tiene un plan vigente; no se modificaron los datos`,
            );
          const plan = Plan.reconstruir({
            id: planId,
            profesorUsuarioId,
            fechaInicio: inicio,
            fechaFin: validez.fin,
            dias: Array.from({ length: 28 }, (_, i) => ({ numero: i + 1, rutinaId: null })),
            alumnoIds: [id(300 + (grupo - 1) * 2 + 1)],
          });
          await manager.save(PlanEsquema, PlanMapper.aEsquema(plan));
        }
      }
    });
  }
}
