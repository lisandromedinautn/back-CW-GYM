import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const MODULOS = ['identidad', 'catalogo', 'planificacion', 'entrenamiento'];
const CAPAS = 'dominio|aplicacion|infraestructura|presentacion';

// CLAUDE.md, regla de dependencia 4: un módulo no importa el interior de otro.
// Se habla por la Fachada (API pública del módulo) o por eventos de dominio.
const sinInteriorDeOtrosModulos = (modulo) =>
  MODULOS.filter((otro) => otro !== modulo).map((otro) => ({
    regex: `(^|/)${otro}/(${CAPAS})(/|$)`,
    message: `El módulo ${modulo} no importa el interior de ${otro}: usá su Fachada o sus eventos (CLAUDE.md, regla 4).`,
  }));

// docs/TESTING.md: está prohibido debilitar o saltear tests.
const PROHIBIDO_EN_TESTS = ['describe', 'it', 'test'].flatMap((objeto) =>
  ['only', 'skip', 'todo', 'skipIf', 'runIf'].map((propiedad) => ({
    object: objeto,
    property: propiedad,
    message: 'Prohibido saltear o aislar tests (docs/TESTING.md).',
  })),
);

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-properties': ['error', ...PROHIBIDO_EN_TESTS],
      'no-restricted-globals': [
        'error',
        { name: 'xit', message: 'Prohibido saltear tests (docs/TESTING.md).' },
        { name: 'xdescribe', message: 'Prohibido saltear tests (docs/TESTING.md).' },
        { name: 'fit', message: 'Prohibido aislar tests (docs/TESTING.md).' },
        { name: 'fdescribe', message: 'Prohibido aislar tests (docs/TESTING.md).' },
      ],
    },
  },
  // Reglas 1 y 4: el dominio es TypeScript puro.
  ...MODULOS.map((modulo) => ({
    files: [`src/modulos/${modulo}/dominio/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', 'typeorm', 'pg', 'express'],
              message:
                'El dominio es TypeScript puro: no importa Nest, TypeORM ni Express (CLAUDE.md, regla 1).',
            },
            {
              regex: '(^|/)(aplicacion|infraestructura|presentacion)(/|$)',
              message: 'El dominio no depende de otras capas (CLAUDE.md, regla 1).',
            },
            ...sinInteriorDeOtrosModulos(modulo),
          ],
        },
      ],
    },
  })),
  // Regla 2: la aplicación depende solo del dominio (de los puertos, no de las implementaciones).
  ...MODULOS.map((modulo) => ({
    files: [`src/modulos/${modulo}/aplicacion/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['typeorm', 'pg', 'express', '@nestjs/typeorm'],
              message:
                'La aplicación usa puertos del dominio, no la base de datos (CLAUDE.md, regla 2).',
            },
            {
              regex: '(^|/)(infraestructura|presentacion)(/|$)',
              message: 'La aplicación depende solo del dominio (CLAUDE.md, regla 2).',
            },
            ...sinInteriorDeOtrosModulos(modulo),
          ],
        },
      ],
    },
  })),
  // Regla 4 para las capas externas.
  ...MODULOS.map((modulo) => ({
    files: [
      `src/modulos/${modulo}/infraestructura/**/*.ts`,
      `src/modulos/${modulo}/presentacion/**/*.ts`,
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: sinInteriorDeOtrosModulos(modulo) }],
    },
  })),
  {
    files: ['src/compartido/dominio/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', 'typeorm', 'pg', 'express'],
              message: 'El dominio compartido es TypeScript puro (CLAUDE.md, regla 1).',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
