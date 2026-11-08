import { defineConfig, mergeConfig } from 'vitest/config';
import unitarios from './vitest.config.js';

// `yarn test:cov`: mide la cobertura de las tres suites juntas (unitarios, integración y e2e),
// porque la infraestructura y la presentación se prueban contra la base real y no con
// unitarios. Los umbrales son los de vitest.config.ts (decisión 22). Requiere `yarn bd:levantar`.
// `yarn test` y el pre-commit siguen usando vitest.config.ts (solo unitarios, sin base).
export default mergeConfig(
  unitarios,
  defineConfig({
    test: {
      include: [
        'src/**/*.spec.ts',
        'test/integracion/**/*.int-spec.ts',
        'test/e2e/**/*.e2e-spec.ts',
      ],
      // Integración y e2e comparten la base de test: los archivos se ejecutan de a uno.
      fileParallelism: false,
      testTimeout: 20_000,
      hookTimeout: 30_000,
    },
  }),
);
