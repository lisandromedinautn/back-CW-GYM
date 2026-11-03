import { defineConfig } from 'vitest/config';

// Tests unitarios: dominio puro y casos de uso con puertos falsos (docs/TESTING.md).
// `yarn test:cov` aplica los umbrales de la decisión 22.
export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    setupFiles: ['test/preparar-vitest.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Solo se excluye el cableado de Nest (arranque, módulos y punto de entrada de las semillas).
      exclude: ['src/main.ts', 'src/semillas.ts', 'src/**/*.module.ts', 'src/**/*.spec.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        'src/modulos/*/dominio/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
        'src/compartido/dominio/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  },
});
