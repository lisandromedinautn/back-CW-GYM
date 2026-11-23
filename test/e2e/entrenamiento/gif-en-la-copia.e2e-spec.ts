import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PUBLICADOR_EVENTOS } from '../../../src/compartido/dominio/publicador-eventos/publicador-eventos.puerto.js';
import { Reloj } from '../../../src/compartido/dominio/reloj/reloj.puerto.js';
import { configurarAplicacion } from '../../../src/configurar-aplicacion.js';
import { ModuloRaiz } from '../../../src/modulo-raiz.module.js';
import { CargarDatasetEjercicios } from '../../../src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.js';
import { FuenteDatasetEjercicios } from '../../../src/modulos/catalogo/dominio/dataset/fuente-dataset-ejercicios.puerto.js';
import { FuenteDatasetEjerciciosArchivo } from '../../../src/modulos/catalogo/infraestructura/dataset/fuente-dataset-ejercicios.archivo.js';
import { SembrarUsuarios } from '../../../src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.js';

const GIF_PRESS =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0577-T0yTjgW.gif';
const GIF_PLANCHA =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2135-VBAWRPG.gif';

describe('RN-ENT-02 · la copia del entrenamiento guarda el GIF de cada ejercicio (T14)', () => {
  let app: INestApplication;
  let alumno: string;
  let inicio: request.Response;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloRaiz] })
      .overrideProvider(Reloj)
      .useValue({ ahora: () => new Date('2026-11-20T12:00:00.000Z') })
      .overrideProvider(PUBLICADOR_EVENTOS)
      .useValue({ publicar: () => Promise.resolve() })
      .overrideProvider(FuenteDatasetEjercicios)
      .useValue(new FuenteDatasetEjerciciosArchivo('test/datasets/ejercicios-fixture.json'))
      .compile();
    app = configurarAplicacion(modulo.createNestApplication());
    await app.init();
    const bd = app.get(DataSource);
    await limpiar(bd);
    await app.get(SembrarUsuarios).ejecutar();
    await app.get(CargarDatasetEjercicios).ejecutar();
    const api = () => request(app.getHttpServer());
    const ingresar = async (email: string): Promise<string> =>
      (
        await api()
          .post('/identidad/ingreso')
          .send({ email, contrasenia: 'clave-de-semilla' })
          .expect(200)
      ).body.token;
    const profesor = await ingresar('profesor01@cwgym.test');
    alumno = await ingresar('alumno01@cwgym.test');
    const {
      body: { codigo },
    } = await api()
      .post('/identidad/profesores/codigo')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(201);
    await api()
      .post('/identidad/alumnos/vinculo')
      .set('Authorization', `Bearer ${alumno}`)
      .send({ codigo })
      .expect(200);
    const { body: alumnos } = await api()
      .get('/identidad/alumnos')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    const { body: ejercicios } = await api()
      .get('/catalogo/ejercicios')
      .set('Authorization', `Bearer ${profesor}`)
      .expect(200);
    const id = (nombre: string) =>
      (ejercicios as { id: string; nombre: string }[]).find((e) => e.nombre === nombre)?.id;
    const { body: rutina } = await api()
      .post('/planificacion/rutinas')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        nombre: 'Fuerza',
        bloques: [
          {
            ejercicioId: id('lever chest press'),
            series: 3,
            micropausaSegundos: 20,
            macropausaSegundos: 60,
            repeticiones: 10,
            orden: 2,
          },
        ],
        circuitos: [
          {
            orden: 1,
            vueltas: 2,
            macropausaSegundos: 45,
            ejercicios: [
              { ejercicioId: id('weighted front plank'), segundos: 30 },
              { ejercicioId: id('lever chest press'), repeticiones: 8 },
            ],
          },
        ],
      })
      .expect(201);
    await api()
      .post('/planificacion/planes')
      .set('Authorization', `Bearer ${profesor}`)
      .send({
        fechaInicio: '2026-11-20',
        alumnos: [alumnos[0].id],
        dias: Array.from({ length: 28 }, (_, i) => ({ numero: i + 1, rutinaId: rutina.id })),
      })
      .expect(201);
    inicio = await api()
      .post('/entrenamiento/entrenamientos')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(201);
  });

  afterAll(async () => {
    if (!app) return;
    await limpiar(app.get(DataSource));
    await app.close();
  });

  it('al iniciar, el press del bloque y la plancha del circuito traen su GIF del catálogo', () => {
    const { rutina } = inicio.body;
    expect([rutina.bloques[0].urlGif, rutina.circuitos[0].ejercicios[0].urlGif]).toEqual([
      GIF_PRESS,
      GIF_PLANCHA,
    ]);
  });

  it('al retomar el entrenamiento en curso, la copia conserva los mismos GIF', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/entrenamiento/mi-entrenamiento-en-curso')
      .set('Authorization', `Bearer ${alumno}`)
      .expect(200);
    const { rutina } = body.entrenamiento;
    expect([rutina.bloques[0].urlGif, rutina.circuitos[0].ejercicios[0].urlGif]).toEqual([
      GIF_PRESS,
      GIF_PLANCHA,
    ]);
  });
});

async function limpiar(bd: DataSource) {
  await bd.query(
    'TRUNCATE TABLE series_realizadas, entrenamientos, planes, rutinas, alumnos, profesores, usuarios CASCADE',
  );
}
