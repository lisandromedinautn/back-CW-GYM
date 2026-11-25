import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Nombre del esquema de seguridad que usan los controladores en `@ApiBearerAuth(ESQUEMA_JWT)`. */
export const ESQUEMA_JWT = 'jwt';

/** Ruta donde se sirve la documentación interactiva de la API. */
export const RUTA_SWAGGER = 'api';

/**
 * Publica la documentación OpenAPI en `/api` (UI) y `/api-json` (documento). Los endpoints con
 * `@Roles` piden el token que devuelve POST /identidad/ingreso.
 */
export function configurarSwagger(app: INestApplication, version: string): void {
  const config = new DocumentBuilder()
    .setTitle('CW-GYM — Sistema de Entrenamiento de Gimnasio')
    .setDescription(
      'API del sistema: identidad, catálogo de ejercicios, planificación, entrenamiento y ' +
        'notificaciones. Los errores de dominio responden `{ codigo, mensaje }`.',
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
    )
    .build();

  SwaggerModule.setup(RUTA_SWAGGER, app, () => SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });
}
