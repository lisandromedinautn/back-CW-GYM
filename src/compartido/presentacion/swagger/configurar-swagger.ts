import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/** Nombre del esquema de seguridad que usan los controladores en `@ApiBearerAuth(ESQUEMA_JWT)`. */
export const ESQUEMA_JWT = 'jwt';

/** Ruta donde se sirve la documentación interactiva de la API. */
export const RUTA_SWAGGER = 'api';

/**
 * Tags de los controladores, en el orden en que se muestran. Cada controlador usa estos nombres
 * en `@ApiTags`, agrupados por recurso dentro de su módulo.
 */
export const TAGS = {
  identidadIngreso: 'Identidad · Ingreso',
  identidadProfesores: 'Identidad · Profesores',
  identidadAlumnos: 'Identidad · Alumnos',
  catalogo: 'Catálogo',
  planificacionRutinas: 'Planificación · Rutinas',
  planificacionPlanes: 'Planificación · Planes',
  planificacionMiPlan: 'Planificación · Mi plan (Alumno)',
  entrenamientoAlumno: 'Entrenamiento · Alumno',
  entrenamientoProfesor: 'Entrenamiento · Profesor',
  notificaciones: 'Notificaciones',
} as const;

const DESCRIPCION_TAGS: Record<keyof typeof TAGS, string> = {
  identidadIngreso: 'Ingresar al sistema y obtener el token JWT.',
  identidadProfesores: 'Alta de profesores (Admin) y código de vinculación del profesor.',
  identidadAlumnos: 'Alumnos vinculados al profesor y vinculación del alumno con un código.',
  catalogo: 'Catálogo de ejercicios del dataset.',
  planificacionRutinas: 'Rutinas del profesor: bloques, circuitos, nombre e importación.',
  planificacionPlanes: 'Planes de Entrenamiento de 28 días, sus días y sus alumnos.',
  planificacionMiPlan: 'Lo que consulta el alumno: la rutina del día y su plan vigente.',
  entrenamientoAlumno: 'El alumno inicia, registra series, finaliza y carga su percepción.',
  entrenamientoProfesor: 'El profesor consulta los entrenamientos de sus alumnos.',
  notificaciones: 'Bandeja de notificaciones del profesor.',
};

/**
 * Los schemas se agrupan por prefijo (`@ApiSchema({ name })` en cada clase): primero las
 * entidades, después los DTO de entrada y al final las respuestas. Swagger UI los lista en el
 * orden del documento.
 */
const GRUPOS_SCHEMAS = ['Entidad.', 'Dto.', 'Respuesta.'];

const grupo = (nombre: string): number => {
  const indice = GRUPOS_SCHEMAS.findIndex((prefijo) => nombre.startsWith(prefijo));
  return indice === -1 ? GRUPOS_SCHEMAS.length : indice;
};

function ordenarSchemas(documento: OpenAPIObject): OpenAPIObject {
  const schemas = documento.components?.schemas;
  if (!schemas) return documento;
  const ordenados = Object.keys(schemas)
    .sort((a, b) => grupo(a) - grupo(b) || a.localeCompare(b, 'es'))
    .map((nombre) => [nombre, schemas[nombre]] as const);
  documento.components = { ...documento.components, schemas: Object.fromEntries(ordenados) };
  return documento;
}

/**
 * Publica la documentación OpenAPI en `/api` (UI) y `/api-json` (documento). Los endpoints con
 * `@Roles` piden el token que devuelve POST /identidad/ingreso.
 */
export function configurarSwagger(app: INestApplication, version: string): void {
  const builder = new DocumentBuilder()
    .setTitle('CW-GYM — Sistema de Entrenamiento de Gimnasio')
    .setDescription(
      'API del sistema: identidad, catálogo de ejercicios, planificación, entrenamiento y ' +
        'notificaciones. Los errores de dominio responden `{ codigo, mensaje }`.\n\n' +
        'Schemas: `Entidad.*` es la forma pública de cada entidad del dominio, `Dto.*` lo que ' +
        'recibe la API (cuerpo o query) y `Respuesta.*` lo que devuelve cada endpoint.',
    )
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de POST /identidad/ingreso',
      },
      ESQUEMA_JWT,
    );
  for (const clave of Object.keys(TAGS) as (keyof typeof TAGS)[]) {
    builder.addTag(TAGS[clave], DESCRIPCION_TAGS[clave]);
  }

  SwaggerModule.setup(
    RUTA_SWAGGER,
    app,
    () =>
      ordenarSchemas(
        // Sin el tag automático con el nombre del controlador: cada método declara el suyo.
        SwaggerModule.createDocument(app, builder.build(), { autoTagControllers: false }),
      ),
    {
      swaggerOptions: {
        persistAuthorization: true,
        // Al abrir un schema se ven tipo, formato, descripción y ejemplo de cada propiedad
        // (con 1, Swagger UI las muestra colapsadas como `[...]`).
        defaultModelExpandDepth: 3,
      },
    },
  );
}
