import { defineConfig } from 'vitest/config';

// Tests e2e de la API: HTTP (supertest) → guard → controlador → caso de uso → base de test.
// Requiere `yarn bd:levantar`.
export default defineConfig({
  test: {
    include: ['test/e2e/**/*.e2e-spec.ts'],
    environment: 'node',
    setupFiles: ['test/preparar-vitest.ts'],
    // Todos los archivos comparten la misma base: se ejecutan de a uno.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
