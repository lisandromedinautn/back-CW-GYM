import { type INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configuración HTTP común al arranque (main.ts) y a los tests e2e, para que prueben lo mismo
 * que corre en producción. El guard de roles y el filtro de errores se registran como
 * APP_GUARD y APP_FILTER en ModuloCompartido.
 */
export function configurarAplicacion<T extends INestApplication>(app: T): T {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  return app;
}
