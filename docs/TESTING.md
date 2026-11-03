# Protocolo de testing — back-CW-GYM

El objetivo principal del proyecto es una base de tests sólida. Un test vale si protege una regla de negocio, no si pasa.

## Niveles

| Nivel | Qué prueba | Dónde | Archivo | Base de datos |
| :-- | :-- | :-- | :-- | :-- |
| Unitario | Entidades, objetos de valor y estrategias (dominio puro). Casos de uso con puertos falsos en memoria | Junto al archivo, en `src/` | `*.spec.ts` | No |
| Integración | Caso de uso + repositorio TypeORM real | `test/integracion/<modulo>/` | `*.int-spec.ts` | Postgres de test dockerizado |
| e2e (solo API) | HTTP → guard → controlador → caso de uso → base | `test/e2e/<modulo>/` | `*.e2e-spec.ts` | Postgres de test dockerizado |

* Herramientas: Jest, ts-jest y supertest. Lint con ESLint + Prettier.
* La base de test es un contenedor separado del de desarrollo. Cada proceso de Jest usa su propio esquema o base, para poder correr en paralelo. Se limpia entre tests.
* Se mockea solo en los bordes del sistema: base de datos (en unitarios), reloj y JWT. Nunca se mockean entidades ni objetos de valor propios.
* El tiempo siempre entra por el puerto `Reloj`. Ningún test depende de la fecha real.

## Cobertura

| Alcance | Umbral bloqueante | Meta |
| :-- | :-- | :-- |
| `src/modulos/*/dominio/**` | 80% en líneas, ramas, funciones y sentencias | Superar el 80% |
| Resto de `src/` | 70% | — |

Los umbrales se configuran en `jest.config` (T02). Si no se alcanzan, `yarn test:cov` falla y el hook bloquea el commit. Para buscar brechas se usa la skill `coverage` (ver más abajo).

## Ciclo para escribir un test (TDD)

Se sigue la skill `tdd` (rojo → verde, de a un corte vertical por vez) con estos pasos extra obligatorios:

1. **Identificar la RN.** Se busca en el `CLAUDE.md` del módulo. Si no existe o está "a confirmar", se frena y se le pregunta al desarrollador.
2. **Preguntar al desarrollador antes de escribir.** Para cada RN, el agente propone y el desarrollador confirma:
   * La costura: por qué interfaz pública se prueba (entidad, caso de uso o endpoint).
   * **Qué se ingresa** (datos concretos).
   * **Qué se espera** (valor literal, error con su código RN o evento emitido).
   * Los caminos a cubrir: cada rama de cada condición compuesta, los valores límite (por ejemplo, 10 y 11 repeticiones para el 1RM; día 1, 28 y 29 del plan) y los casos de error.
3. **Registrar la ficha** en `src/modulos/<modulo>/FICHAS-TEST.md`, con la columna "Obtenido" vacía.
4. **Escribir el test y verlo fallar** por la razón correcta: una aserción que no se cumple, no un error de import. Si el primer rojo es de compilación, se crea el esqueleto mínimo y se vuelve a correr hasta tener un rojo de aserción.
5. **Implementar lo mínimo** para ponerlo en verde.
6. **Verificar que el test muerde**: se rompe a propósito la línea de producción que lo hace pasar (por ejemplo, se cambia `+ 27` por `+ 28`), se confirma que el test falla y se restaura. Si sigue verde, el test no sirve y se rehace.
7. **Actualizar** la ficha (Obtenido = esperado, fecha), `docs/TRAZABILIDAD.md` y `ATLAS.md`.

## Cómo se escribe un test

```
describe('RN-PLAN-09 · la fecha de fin del plan es inicio + 27 días', () => {
  it('con inicio el 03/11/2026, la fecha de fin es el 30/11/2026', ...)
  it('no acepta una fecha de fin distinta de la calculada', ...)
})
```

* El `describe` lleva el ID de la RN y la regla. El `it` describe el caso con sus datos concretos.
* El esperado es un **literal** que sale de la regla o de un ejemplo trabajado (RN-ENT-12: 90 kg / 540 kg / 108 kg). Nunca se recalcula con la misma fórmula del código (test tautológico).
* Una aserción lógica por test. Los errores se verifican por tipo y por código RN, no solo "que lance algo".
* Se verifica a través de la interfaz pública: no se consulta la base por fuera del repositorio ni se prueban métodos privados.

## Cuando un test falla después de un cambio

**El test no se toca.** El agente:

1. Reporta: test, RN, entrada, **esperado** y **obtenido**. Actualiza la columna "Obtenido" de la ficha.
2. Pregunta al desarrollador: "¿Cambió la regla RN-XXX-nn o es un bug de producción?".
3. **Si es un bug:** se corrige producción. El test queda igual.
4. **Si cambió la regla:** primero se actualiza la RN en el `CLAUDE.md` del módulo (historial con fecha y quién la decidió). Después la ficha, después el test. Por último se registra en `DECISIONES-IA.md`.

Editar un `*.spec.ts`, `*.int-spec.ts` o `*.e2e-spec.ts` existente pide confirmación (`.claude/settings.json`). Está prohibido sortear ese control editando por shell.

**PROHIBIDO en cualquier caso:** `skip`, `only`, `todo`, `xit`, aflojar un valor esperado, cambiar `toBe` por `toBeTruthy` o similar, y borrar asserts que siguen valiendo.

## Ficha de test

Cada módulo tiene su `FICHAS-TEST.md`:

| Test (archivo › caso) | RN | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- |

## Skills

* **`tdd`** (`.claude/skills/tdd`, de mattpocock/skills): el ciclo rojo → verde, las costuras acordadas con el usuario y los antipatrones (tests acoplados a la implementación, tautológicos y cortes horizontales). Menciona una skill `codebase-design` que no está instalada: si se necesita ese vocabulario, se usa el de este documento.
* **`coverage`** (`.claude/skills/coverage`, de alirezarezvani/claude-skills): mapea superficies sin testear y prioriza brechas. Está escrita para Playwright. Acá se adapta así: en lugar de rutas de página se mapean los endpoints de `ATLAS.md` y las RN de cada módulo; la cobertura real sale de `yarn test:cov`; y el paso de autogenerar con `/pw:generate` **no se usa**, porque cada test nuevo pasa por el ciclo de arriba.

## Lint y hooks

* ESLint (flat config) + Prettier.
* Pre-commit (husky + lint-staged): lint de los archivos staged y tests relacionados.
* Antes de publicar una versión (tag en `develop`) o de un merge `develop` → `main`: `yarn lint`, `yarn test:cov`, `yarn test:int` y `yarn test:e2e`, todos en verde.
