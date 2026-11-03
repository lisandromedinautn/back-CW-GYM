import { defineConfig } from 'vitest/config';

// Tests de integración: caso de uso + repositorio TypeORM real contra la base de test
// (docker compose, servicio bd-test). Requiere `yarn bd:levantar`.
export default defineConfig({
  test: {
    include: ['test/integracion/**/*.int-spec.ts'],
    environment: 'node',
    setupFiles: ['test/preparar-vitest.ts'],
    // Todos los archivos comparten la misma base: se ejecutan de a uno.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
