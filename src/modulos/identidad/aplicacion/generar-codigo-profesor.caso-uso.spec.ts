import { beforeEach, describe, expect, it } from 'vitest';
import {
  GeneradorCodigosFalso,
  RepositorioProfesoresEnMemoria,
} from '../../../../test/dobles/identidad.js';
import { Documento } from '../dominio/documento.valor.js';
import { Profesor } from '../dominio/profesor.entidad.js';
import { ConsultarCodigoProfesor } from './consultar-codigo-profesor.caso-uso.js';
import { GenerarCodigoProfesor } from './generar-codigo-profesor.caso-uso.js';

describe('RN-IDE-08 · un profesor tiene a lo sumo un código vigente; regenerarlo invalida el anterior', () => {
  let profesores: RepositorioProfesoresEnMemoria;

  beforeEach(async () => {
    profesores = new RepositorioProfesoresEnMemoria();
    await profesores.guardar(
      Profesor.crear({
        usuarioId: 'u-laura',
        nombre: 'Laura',
        apellido: 'Gómez',
        documento: Documento.crear('DNI', '30111222'),
        legajo: 'P-001',
      }),
    );
  });

  const generar = (...codigos: string[]) =>
    new GenerarCodigoProfesor(profesores, new GeneradorCodigosFalso(codigos));
  const consultar = () => new ConsultarCodigoProfesor(profesores);

  it('sin código, con el generador que da ABC234, el código vigente es ABC234', async () => {
    const codigo = await generar('ABC234').ejecutar('u-laura');

    expect([codigo, await consultar().ejecutar('u-laura')]).toEqual(['ABC234', 'ABC234']);
  });

  it('con ABC234, regenerar (XYZ789) deja vigente XYZ789 y ABC234 ya no encuentra al profesor', async () => {
    const generador = generar('ABC234', 'XYZ789');
    await generador.ejecutar('u-laura');
    await generador.ejecutar('u-laura');

    expect([
      await consultar().ejecutar('u-laura'),
      await profesores.buscarPorCodigo('ABC234'),
      (await profesores.buscarPorCodigo('XYZ789'))?.legajo,
    ]).toEqual(['XYZ789', null, 'P-001']);
  });

  it('sin código generado, la consulta devuelve null', async () => {
    expect(await consultar().ejecutar('u-laura')).toBeNull();
  });
});
