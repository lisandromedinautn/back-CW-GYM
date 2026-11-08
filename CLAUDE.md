# back-CW-GYM — CLAUDE.md global

API del Sistema de Entrenamiento de Gimnasio: NestJS + TypeORM + PostgreSQL, enfoque DDD. El front está en `../front-CW-GYM`.

**Para navegar, empezá por [ATLAS.md](ATLAS.md).** No recorras carpetas a ciegas: el atlas dice dónde está cada cosa. Si algo no figura en el atlas, buscalo con Grep o Glob y después agregalo.

## Documentos de referencia

| Necesito… | Leo… |
| :-- | :-- |
| Dónde está cada módulo, caso de uso, endpoint y test | [ATLAS.md](ATLAS.md) |
| Las reglas de negocio de un módulo | `src/modulos/<modulo>/CLAUDE.md` (fuente de verdad de las RN) |
| La ficha de un test (entrada, esperado, obtenido) | `src/modulos/<modulo>/FICHAS-TEST.md` |
| Glosario, decisiones, US y modelo DDD | [docs/PLANIFICACION.md](docs/PLANIFICACION.md) |
| Protocolo de testing y TDD | [docs/TESTING.md](docs/TESTING.md) |
| Matriz US → RN → caso de uso → test | [docs/TRAZABILIDAD.md](docs/TRAZABILIDAD.md) |
| Qué modelo usar y plantillas de prompt | [docs/MODELOS-IA.md](docs/MODELOS-IA.md) |
| Registro de sesiones con IA | [DECISIONES-IA.md](DECISIONES-IA.md) |

## Idioma

Todo en español: dominio, clases, archivos, carpetas, tests, commits y documentación. Los términos son los del glosario (`docs/PLANIFICACION.md`), sin sinónimos: se dice "Entrenamiento", no "sesión"; "ingresar al sistema", no "login" (salvo en nombres de librerías).

## Arquitectura

```
src/
  modulos/<modulo>/
    dominio/          entidades ricas, objetos de valor, eventos, puertos (interfaces de repositorio)
    aplicacion/       un caso de uso por archivo (<accion>.caso-uso.ts) y sus DTO
    (dentro de dominio/ y aplicacion/, una carpeta por concepto o caso de uso, con su spec: ver ATLAS.md, "Carpetas por concepto")
    infraestructura/  repositorios TypeORM, entidades de persistencia, mappers, adaptadores
    presentacion/     controladores, guards específicos, validación de entrada
    CLAUDE.md         reglas de negocio del módulo (RN-<MOD>-nn)
    FICHAS-TEST.md    fichas de cada test
  compartido/         kernel compartido: base de entidad y evento, errores de dominio, JWT, guard de roles
test/
  integracion/<modulo>/   casos de uso + repositorio real contra la base de test
  e2e/<modulo>/           API HTTP completa (supertest) contra la base de test
  datasets/               fixture del dataset de ejercicios (T01)
```

Reglas de dependencia (se revisan en cada code review):

1. `dominio` no importa nada de Nest, TypeORM ni de otras capas. Es TypeScript puro.
2. `aplicacion` depende solo de `dominio` (de los puertos, nunca de implementaciones).
3. `infraestructura` y `presentacion` dependen hacia adentro; nunca al revés.
4. Un módulo no importa el `dominio` ni la `infraestructura` de otro. Usa la API pública que el otro exporta (Fachada) o escucha sus eventos (Observador). Si planificación necesita saber si un alumno está vinculado, define su propio puerto (por ejemplo `ConsultaVinculos`) y la infraestructura lo implementa llamando a la Fachada de identidad.
5. **No hay services.** La lógica de negocio vive en las entidades y objetos de valor. Los casos de uso orquestan: cargan, invocan al dominio, persisten y publican eventos.

### Entidad rica

* Se construye con un método de fábrica estático (`Plan.crear(...)`) que valida las invariantes y lanza un error de dominio si no se cumplen. Para rehidratar desde la base se usa otro método (`Plan.reconstruir(...)`) que no vuelve a emitir eventos.
* Sin setters públicos: los cambios de estado son métodos con nombre de dominio (`asignarAlumno`, `finalizar`).
* La entidad de dominio no es la entidad de TypeORM. Un mapper en `infraestructura` traduce entre las dos.

### SOLID y patrones (Sommerville, cap. 6 y 7)

| Patrón / principio | Dónde se aplica |
| :-- | :-- |
| Arquitectura en capas | Las cuatro capas de cada módulo |
| Repositorio | Puertos en `dominio`, TypeORM en `infraestructura` (inversión de dependencias, DIP) |
| Fachada | API pública de cada módulo hacia los demás |
| Observador | Eventos de dominio (AlumnoVinculado, EntrenamientoFinalizado, etc.) |
| Estrategia | Cálculo de carga efectiva según el tipo de carga; récords según el tipo de ejercicio |
| Fábrica | `crear` / `reconstruir` en las entidades |
| Decorador | Guards de rol y validación en los controladores |
| SRP | Un caso de uso por archivo, una responsabilidad por clase |
| OCP | Un tipo de carga o de récord nuevo se agrega como estrategia nueva, sin editar las existentes |

## Paquetes (Yarn 1): regla estricta

**PROHIBIDO instalar una versión publicada hace menos de 24 horas.** Yarn 1 no lo controla solo, así que antes de cada `yarn add` o `yarn upgrade`:

1. `npm view <paquete>@<versión> time --json` para ver la fecha de publicación de esa versión.
2. Si pasaron menos de 24 h, se elige la versión anterior que cumpla.
3. Se instala fijando la versión exacta: `yarn add <paquete>@<versión> --exact`.
4. Se commitea `yarn.lock`. En CI y en los hooks se usa `yarn install --frozen-lockfile`.

Los comandos `yarn add`, `yarn upgrade` y `npx` piden confirmación (`.claude/settings.json`). El pre-commit corre `scripts/verificar-antiguedad-paquetes.mjs`: si cambia `package.json` controla las dependencias directas, y si cambia `yarn.lock` controla también las transitivas nuevas. A mano: `yarn verificar:paquetes`. Si una transitiva tiene menos de 24 h, se fija la versión anterior con `resolutions` en `package.json` (en Yarn 1, `"<dependencia-directa>/**/<paquete>"` para apuntar a una rama del árbol).

Node: **24 LTS** (`.nvmrc`). Varias herramientas piden 24.15 o más.

## Testing: reglas que no se negocian

El protocolo completo está en [docs/TESTING.md](docs/TESTING.md). Resumen:

1. **Cada test cita su regla de negocio**: `describe('RN-PLAN-09 · la fecha de fin es inicio + 27 días', ...)`. Si no hay una RN que lo justifique, el test no se escribe.
2. **Antes de escribir un test, se le pregunta al desarrollador** qué se ingresa, qué se espera y qué casos hay que cubrir (los caminos felices, los límites y los errores). Las RN marcadas "a confirmar" no se testean ni se implementan.
3. **Rojo antes que verde.** El test tiene que fallar primero, por la razón correcta. Se usan las skills `tdd` (ciclo) y `coverage` (brechas).
4. **El valor esperado es un literal** sacado de la regla o de un ejemplo trabajado, nunca recalculado como lo calcula el código.
5. **PROHIBIDO modificar un test existente sin preguntar.** Si un test falla después de un cambio, se reporta test, RN, entrada, esperado y obtenido, y se pregunta si cambió la regla. Editar archivos `*.spec.ts` pide confirmación (`.claude/settings.json`). Tampoco se editan tests por shell (sed, echo, etc.).
6. PROHIBIDO debilitar aserciones: nada de `skip`, `only`, `todo`, aflojar valores ni borrar asserts que sigan valiendo.
7. Cobertura: dominio al 80% como mínimo (apuntar a más), resto al 70%. Lint sin errores.

Comandos: `yarn test` (unitarios), `yarn test:int` y `yarn test:e2e` (necesitan `yarn bd:levantar`), `yarn test:cov`, `yarn lint`, `yarn formatear`. Runner: Vitest (decisión 21).

## Git y Trello

* Ramas `main` y `develop`. Cada tarjeta se trabaja en una subrama que sale de `develop` (`feat/US07-crear-plan`) y se integra con `merge --no-ff` y el mensaje `US07 — Título`. Lo que bloquea son los hooks: lint y tests tienen que pasar, y `--no-verify` está prohibido.
* **Microcommits** (decisión 37): un único cambio lógico por commit, que compila y pasa los tests. Test e implementación mínima de una regla van juntos y el refactor va aparte. Sin squash, y sin reescribir commits ya pusheados. Detalle en `docs/PLANIFICACION.md`, sección "Microcommits y trazabilidad".
* Todo commit referencia su tarjeta de Trello. Formato (conventional commits en español, verbo en primera persona): `feat(planificacion): calculo la fecha de fin del plan [US07]`, con el pie `Reglas: RN-...` si toca el test de una regla. Tipos: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
* **Versionado** (decisión 38): SemVer 1.x, sincronizado con el front. La minor sube al cerrar cada fase (hito funcional) y el patch con los arreglos sobre una versión publicada. Cada versión se publica en `develop` con `CHANGELOG.md`, `package.json` y el tag anotado `v1.x.y`.
* **PROHIBIDO tocar `main` hasta el 22/11/2026** (decisión 39). Ese día, con el permiso del desarrollador, se mergea `develop`. En el escenario pesimista hay un segundo merge, como tarde el 01/12. Orden de las fases: `docs/PLAN-IMPLEMENTACION.md`.
* El agente no commitea ni pushea sin que el desarrollador se lo pida.

## Trabajo con IA

* **Delegación**: el orquestador (Opus 5.5) planifica y prioriza delegar en subagentes. Antes de delegar, propone el reparto por consola y espera la confirmación del desarrollador. Una tarea se divide en subacciones si lo amerita. Varios subagentes pueden trabajar en paralelo mientras no toquen los mismos archivos. No se le da a Haiku un módulo entero con lógica compleja solo para cumplir con la regla de delegar. Modelos, esfuerzos y plantillas: [docs/MODELOS-IA.md](docs/MODELOS-IA.md). La decisión final de qué modelo usar es del desarrollador.
* **Auditoría**: al cerrar cada sesión relevante se agrega una entrada a [DECISIONES-IA.md](DECISIONES-IA.md) con lo que hizo la IA, lo que decidió el desarrollador y las ideas descartadas. Si la sesión tocó los dos repos, va en ambos.
* **Documentación viva**: si cambia una regla, se actualizan en el mismo commit el `CLAUDE.md` del módulo (con fecha y quién la cambió), el glosario si corresponde, `docs/TRAZABILIDAD.md` y `ATLAS.md`. Si el cambio afecta al front, se avisa para replicarlo en `../front-CW-GYM`.
