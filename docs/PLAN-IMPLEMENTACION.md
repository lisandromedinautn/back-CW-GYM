# Plan de implementación por fases

Versión 2 · 02/11/2026 · Lisandro (Licha)
Existe igual en `back-CW-GYM` y `front-CW-GYM`. Se basa en [`docs/PLANIFICACION.md`](PLANIFICACION.md) (v3): de ahí salen las historias, los puntos, el versionado (decisión 38), los microcommits (decisión 37) y el calendario (decisión 39). Este documento fija el orden de trabajo y lleva el registro de avance.

**Cómo se usa**

* Cada fase termina en una versión publicada en los dos repos, con su tag en `develop`. La fase 0 es la base técnica y las fases 1 a 5 son hitos funcionales; no coinciden con los sprints.
* **`main` no se toca hasta el 22/11/2026** (decisión 39).
* El estado de cada tarea se actualiza en el mismo commit que la termina: ⬜ sin empezar · 🔄 en curso · ✅ terminada · ⛔ bloqueada (se anota el motivo).
* La columna **Orden** marca las dependencias. Las tareas con el mismo número no dependen entre sí y se pueden hacer en paralelo, también con subagentes (ver `docs/MODELOS-IA.md`).
* El **registro de la fase** se completa al cerrarla. Alimenta la velocity y el desvío entre lo estimado y lo real (OKR O2).
* Cada fase tiene dos fechas de fin: la del escenario ideal y la del pesimista (ver "Calendario y escenarios").

## Definición de terminado

**De una tarea (tarjeta)**

* [ ] Cada regla de negocio de la tarea tiene al menos un test en verde y figura en `docs/TRAZABILIDAD.md`.
* [ ] Tiene microcommits con el formato de la decisión 37, en una subrama integrada a `develop` con `merge --no-ff`.
* [ ] Pasan lint, tests y cobertura (dominio ≥ 80%, resto ≥ 70%).
* [ ] Si cambió una regla, se actualizaron el `CLAUDE.md` del módulo, el glosario y el `ATLAS.md`.
* [ ] Tiene su entrada en la sección "Sin publicar" del `CHANGELOG.md`.
* [ ] Está en DONE en Trello el mismo día en que se termina.

**De una fase (versión)**

* [ ] Todas sus tareas están ✅, o las que se pasan a la fase siguiente están anotadas en el registro con su motivo.
* [ ] Las reglas de negocio de la fase no tienen brechas en la matriz (ninguna RN vigente sin test).
* [ ] Se hizo la demo del hito y los bugs encontrados se cargaron como tarjetas `BUG-xx`.
* [ ] La versión está publicada en los dos repos: `CHANGELOG.md`, `package.json` y tag anotado `v1.x.0` en `develop` (ver "Cómo se publica una minor" en la planificación).
* [ ] Se comparó lo acumulado con las dos líneas del calendario. Si quedó por debajo de la pesimista, se consultó un recorte de alcance.
* [ ] Están la entrada en `DECISIONES-IA.md` y el registro de la fase completo.

## Calendario y escenarios

| Sprint | Fechas | Escenario |
| :-- | :-- | :-- |
| 1 | lun 02/11 al dom 08/11 | Los dos |
| 2 | lun 09/11 al dom 15/11 | Los dos |
| 3 | lun 16/11 al dom 22/11 | Los dos. **Fin del ideal** y primer merge a `main` |
| 4 | lun 23/11 al mar 01/12 | Solo el pesimista. **Fin del pesimista** |

| Escenario | Ritmo | Fin | Viabilidad |
| :-- | :-- | :-- | :-- |
| **Ideal** | 45,3 pts/semana | sáb 22/11 | **La velocity histórica (37) no alcanza**: necesita un 22% más. Queda como objetivo, no como compromiso |
| **Pesimista** | 37 pts/semana (velocity histórica) | jue 27/11, con margen hasta el mar 01/12 | Viable. El margen (~21 pts) cubre los e2e de Playwright, los ajustes y el informe |

**Control al cierre de cada sprint**

| Corte | Acumulado ideal | Acumulado pesimista | Real |
| :-- | :-- | :-- | :-- |
| dom 08/11 | 45 | 37 | |
| dom 15/11 | 91 | 74 | |
| dom 22/11 | 136 | 111 | |
| mar 01/12 | — | 136 | |

Si lo real queda por debajo de la línea pesimista, se le consulta al desarrollador un recorte. Las candidatas, en este orden, son US20 (6), US10 (6), US18 (6) y US12 (4): ninguna bloquea a otra.

**`main`.** No se toca hasta el 22/11. Ese día, con permiso, se mergea `develop` con la última versión publicada. Si se da el escenario pesimista, hay un segundo merge al cerrar, como tarde el 01/12.

## Resumen

| Fase | Versión | Puntos | Acumulado | Fin ideal | Fin pesimista | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 0. Base técnica | 1.0.0 | 4 | 4 | lun 03/11 | lun 03/11 | ✅ |
| 1. Ingreso, catálogo y vínculo | 1.1.0 | 20 | 24 | vie 07/11 | dom 08/11 | 🔄 |
| 2. Planificación básica | 1.2.0 | 28 | 52 | mar 11/11 | jue 13/11 | ⬜ |
| 3. Más rutinas e inicio del entrenamiento | 1.3.0 | 36 | 88 | dom 16/11 | jue 20/11 | ⬜ |
| 4. Registro, resumen y récords | 1.4.0 | 33 | 121 | vie 21/11 | mié 26/11 | ⬜ |
| 5. Seguimiento y cierre del MVP | 1.5.0 | 6 | 127 | sáb 22/11 | jue 27/11 (margen hasta 01/12) | ⬜ |
| **Total** | | **127** | | | | |

Las fechas suponen un ritmo parejo de 6,5 pts/día en el ideal y 5,3 pts/día en el pesimista, contados de lunes a domingo, igual que la velocity histórica.

**Nota (decisión 41, 08/11/2026):** el recorte de US01 deja 9 pts de margen. El total pasa de 136 a 127 y la fase 1 de 29 a 20. Las tablas de control y de velocity de la planificación se dejan con las cifras originales.

---

## Fase 0 — Base técnica · v1.0.0

**Objetivo:** que los dos proyectos arranquen, que los tests corran con sus umbrales y que los hooks hagan cumplir las reglas de microcommits y de testing antes de escribir la primera regla de negocio.

| Orden | Tarjeta | Tarea | Repo | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | T03 | Glosario, atlas y `CLAUDE.md` por módulo | ambos | 1 | ✅ |
| 2 | T02 | Setup del proyecto y baseline de tests | ambos | 3 | ✅ |

**Checklist de T02 (back)**

* [x] Proyecto NestJS 12 (ESM) con la estructura `src/modulos/<modulo>/{dominio,aplicacion,infraestructura,presentacion}` y `src/compartido`.
* [x] TypeORM con PostgreSQL 18 en Docker: una base de desarrollo (5442) y otra de test (5443), separadas (`docker-compose`).
* [x] Vitest con tres configuraciones (unit, int, e2e) y umbrales de cobertura: `dominio` 80%, resto 70% (decisión 21: Vitest en lugar de Jest).
* [x] Comandos `yarn test`, `yarn test:int`, `yarn test:e2e`, `yarn test:cov`, `yarn lint`.
* [x] ESLint + Prettier, con las reglas de capas del `CLAUDE.md` como errores de lint.
* [x] husky + lint-staged: `pre-commit` corre lint y los tests afectados.
* [x] Hook `commit-msg` que valida el formato de la decisión 37: tipo, módulo, `[ID]` al final (script propio, `scripts/validar-mensaje-commit.mjs`).
* [x] Script de verificación de antigüedad de paquetes (24 h), que corre en el pre-commit (directas y transitivas nuevas).
* [x] Infraestructura de seeds: comando `yarn seed` idempotente, que lee `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), y `.env.example` sin valores reales. El seed del Admin en sí se escribe con TDD en US00, porque necesita la entidad de usuario (RN-IDE-14).
* [x] `package.json` con `"version": "1.0.0"` y `CHANGELOG.md` con la sección 1.0.0.

**Checklist de T02 (front)**

* [x] Proyecto React 19 + Vite 8 con la estructura `src/modulos` y `src/compartido`.
* [x] Vitest + Testing Library + MSW con umbrales de cobertura. Playwright configurado (sin tests todavía: un test sin regla de negocio no se escribe).
* [x] Comandos `yarn test`, `yarn test:cov`, `yarn lint` y el script de Playwright.
* [x] ESLint + Prettier, husky + lint-staged y el hook `commit-msg` igual al del back.
* [x] Script de antigüedad de paquetes.
* [x] `package.json` con `"version": "1.0.0"` y `CHANGELOG.md`.

**Criterio de cierre:** en los dos repos, `yarn test:cov` y `yarn lint` pasan sobre el esqueleto vacío, un commit con mal formato o con un test en rojo se rechaza, y el tag `v1.0.0` está en `develop`.

**Registro de la fase 0**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 01/11 | 02/11 | 4 | (a completar) | (a completar) | En T02 el back pasó de Jest a Vitest (Nest 12 es solo ESM) y Node de 22 a 24. Siete transitivas con menos de 24 h se fijaron con `resolutions` |

---

## Fase 1 — Ingreso, catálogo y vínculo · v1.1.0

**Objetivo:** cada rol ingresa al sistema, el catálogo se carga desde el dataset, el Admin da de alta profesores, los alumnos llegan con una semilla de usuarios y se vinculan con su profesor.

**Primero el seed:** el Admin inicial (RN-IDE-14) y la semilla de usuarios de prueba (RN-IDE-05, 06, 07, 12, 13) van en el backend de US00, porque sin ellos no se puede probar US02.

**Decisión 41 (08/11/2026):** US01 sale del MVP y pasa a deuda técnica (DT-06). Sus filas quedan tachadas. El catálogo se carga con T01 desde el dataset de ejercicios, y los alumnos y profesores de prueba, con la semilla de usuarios.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US00 | Backend: seed del Admin, ingresar al sistema (JWT) y guard de roles en `compartido` | back | RN-IDE-01, 02, 03, 14 | 5 | ✅ |
| 1 | US00 | Backend: semilla de usuarios de prueba (`sembrar-usuarios`, `yarn seed`) | back | RN-IDE-05, 06, 07, 12, 13 | incl. en US00 | ✅ |
| 1 | ~~US01~~ | ~~Modelar: Ejercicio, músculos y grupo derivado, factor de peso~~ | ~~back~~ | ~~RN-CAT-01…07~~ | ~~3~~ | — fuera del MVP (DT-06) |
| 2 | US00 | Frontend: página de ingreso, sesión y rutas por rol | front | RN-IDE-01, 02, 03 · RN-UI-IDE-01, 02 | 3 | ⬜ |
| 2 | US02 | Backend: dar de alta un profesor | back | RN-IDE-04, 06, 13 | 1 | ⬜ |
| 2 | ~~US01~~ | ~~Backend: registrar ejercicio~~ | ~~back~~ | ~~RN-CAT-01…07~~ | ~~3~~ | — fuera del MVP (DT-06) |
| 2 | T01 | Carga del dataset de ejercicios (idempotente, `yarn seed`) | back | RN-CAT-01, 05, 07, 08, 09 | 3 | ✅ |
| 3 | US02 | Frontend: página de alta de profesor | front | RN-IDE-04, 06, 13 | 1 | ⬜ |
| 3 | ~~US01~~ | ~~Frontend: página de registro de ejercicio~~ | ~~front~~ | ~~RN-CAT-01…07~~ | ~~3~~ | — fuera del MVP (DT-06) |
| 3 | US04 | Modelar: Código de Profesor | back | RN-IDE-08 | 1 | ⬜ |
| 4 | US04 | Backend y Frontend: generar código de profesor | ambos | RN-IDE-08 | 2 | ⬜ |
| 5 | US05 | Backend: vincular alumno con el código | back | RN-IDE-09, 10, 11 | 3 | ⬜ |
| 6 | US05 | Frontend: página para vincularse con el profesor | front | RN-IDE-09, 10, 11 | 1 | ⬜ |

**Ejemplo de microcommits para US05 (backend).** El pie `Reglas:` se muestra en la misma línea para abreviar; en el commit real va al final del mensaje.

```
feat(identidad): rechazo un código de profesor inexistente [US05]        Reglas: RN-IDE-11
feat(identidad): vinculo al alumno con el profesor del código [US05]     Reglas: RN-IDE-09
feat(identidad): rechazo el vínculo de un alumno que ya tiene profesor [US05]  Reglas: RN-IDE-10
feat(identidad): rechazo un código invalidado por regeneración [US05]   Reglas: RN-IDE-11
refactor(identidad): extraigo la búsqueda de código al repositorio [US05]
feat(identidad): expongo POST /identidad/vinculos con guard de Alumno [US05]
test(identidad): cubro el vínculo con e2e de API [US05]                 Reglas: RN-IDE-03, 09, 10
US05 — Vincular alumno con su profesor   (merge --no-ff)
```

**Criterio de cierre:** la demo pasa de punta a punta en el navegador: el catálogo se carga desde el dataset, el Admin ingresa y da de alta un profesor, el profesor genera su código, y un alumno de la semilla ingresa y se vincula. Están los tags `v1.1.0` en los dos repos.

**Registro de la fase 1**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |

---

## Fase 2 — Planificación básica · v1.2.0

**Objetivo:** el profesor arma una rutina por bloques y un plan de 28 días, y el alumno ve qué le toca hoy.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US06 | Modelar: Rutina, Bloque, Ejercicio Prescripto, Pausa | back | RN-PLAN-01, 02, 04, 05, 06, 07 | 3 | ⬜ |
| 2 | US06 | Backend: crear y editar una rutina por bloques | back | RN-PLAN-01, 02, 04, 05, 06, 07 | 5 | ⬜ |
| 2 | US07 | Modelar: Plan de Entrenamiento, Validez del plan, Día del plan | back | RN-PLAN-09…15, 17 | 3 | ⬜ |
| 3 | US06 | Frontend: editor de rutina (bloques) | front | RN-PLAN-01, 02, 04, 05, 06, 07 | 5 | ⬜ |
| 3 | US07 | Backend: crear plan con alumnos y una rutina o descanso por día | back | RN-PLAN-09…15, 17 | 5 | ⬜ |
| 4 | US07 | Frontend: página de creación de plan | front | RN-PLAN-09…15, 17 | 3 | ⬜ |
| 4 | US08 | Backend: consultar la rutina del día | back | RN-PLAN-11, 15, 18 | 1 | ⬜ |
| 5 | US08 | Frontend: página de la rutina del día | front | RN-PLAN-11, 15, 18 | 3 | ⬜ |

**Punto de atención:** el editor de rutina es la pantalla más compleja del proyecto (COCOMO: 2 puntos de aplicación). Conviene armarlo para que la fase 3 le sume circuitos sin reescribirlo.

**Criterio de cierre:** el profesor crea una rutina, arma un plan de 28 días con un alumno vinculado y descansos, y el alumno ve la rutina de hoy. Un alumno con plan vigente no se puede asignar a otro plan (RN-PLAN-12). Están los tags `v1.2.0`.

**Registro de la fase 2**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |

---

## Fase 3 — Más rutinas e inicio del entrenamiento · v1.3.0

**Objetivo:** rutinas por circuitos y mixtas, reutilizar rutinas, ver el plan completo y empezar a entrenar.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US09 | Modelar: Circuito (2 o más ejercicios, macropausa por vuelta) | back | RN-PLAN-01, 03, 04 | 3 | ⬜ |
| 1 | US11 | Backend: consultar el plan del alumno | back | RN-PLAN-11, 19 | 1 | ⬜ |
| 1 | US13 | Modelar: Entrenamiento (copia de la rutina, peso del día, abandonado) | back | RN-ENT-01, 02, 20 | 3 | ⬜ |
| 2 | US09 | Backend: crear rutina por circuitos | back | RN-PLAN-01, 03, 04 | 5 | ⬜ |
| 2 | US11 | Frontend: página "Mi plan" | front | RN-PLAN-11, 19 | 3 | ⬜ |
| 2 | US13 | Backend: iniciar entrenamiento y consultar el que está en curso | back | RN-ENT-01, 02, 20 | 3 | ⬜ |
| 3 | US09 | Frontend: circuitos en el editor de rutina | front | RN-PLAN-01, 03, 04 | 3 | ⬜ |
| 3 | US10 | Backend: rutina mixta | back | RN-PLAN-01 | 3 | ⬜ |
| 3 | US20 | Backend: importar rutina (copia, solo las propias) | back | RN-PLAN-08 | 3 | ⬜ |
| 3 | US13 | Frontend: página del entrenamiento en curso (inicio y contador) | front | RN-ENT-01, 02, 20 · RN-UI-ENT-02 | 3 | ⬜ |
| 4 | US10 | Frontend: rutina mixta en el editor | front | RN-PLAN-01 | 3 | ⬜ |
| 4 | US20 | Frontend: página de importar rutina | front | RN-PLAN-08 | 3 | ⬜ |

**Punto de atención:** es la fase más cargada (36 pts) y cruza el corte del 15/11. Si en ese corte el acumulado queda por debajo de 74, la primera candidata a recortar o postergar es US20, porque nada depende de ella.

**Criterio de cierre:** el profesor arma una rutina mixta e importa una rutina a otro plan. El alumno ve sus 28 días e inicia el entrenamiento de hoy, y no puede iniciar otro el mismo día (RN-ENT-01). Están los tags `v1.3.0`.

**Registro de la fase 3**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |

---

## Fase 4 — Registro, resumen y récords · v1.4.0

**Objetivo:** el alumno registra lo que hizo, ve su resumen y sus récords, y el profesor ajusta los alumnos del plan vigente.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US14 | Backend: registrar serie realizada | back | RN-ENT-03, 04, 19, 20 | 3 | ⬜ |
| 1 | US16 | Modelar: Récord Personal y Carga Efectiva (Estrategia por tipo de carga, Epley) | back | RN-ENT-10, 11, 12, 13 | 5 | ⬜ |
| 1 | US12 | Backend: agregar y quitar alumnos de un plan vigente | back | RN-PLAN-12, 13, 14, 16 | 3 | ⬜ |
| 2 | US14 | Frontend: registro de series en el entrenamiento en curso | front | RN-ENT-03, 04, 19, 20 · RN-UI-ENT-01 | 5 | ⬜ |
| 2 | US15 | Backend: finalizar entrenamiento (volumen, grupos, duración) | back | RN-ENT-05, 06, 07, 08, 09, 17 | 5 | ⬜ |
| 2 | US12 | Frontend: página de alumnos del plan | front | RN-PLAN-12, 13, 14, 16 | 1 | ⬜ |
| 3 | US16 | Backend: detectar récords al finalizar (evento RécordBatido) | back | RN-ENT-10, 11, 12, 13 | 5 | ⬜ |
| 3 | US17 | Backend: registrar RPE y sensación de fuerza | back | RN-ENT-14, 15, 16 | 1 | ⬜ |
| 4 | US15 | Frontend: página de resumen del entrenamiento | front | RN-ENT-05, 06, 07, 08, 09, 17 | 3 | ⬜ |
| 5 | US16 | Frontend: récords batidos en el resumen | front | RN-ENT-10, 11, 12, 13 | 1 | ⬜ |
| 5 | US17 | Frontend: RPE y sensación en el resumen | front | RN-ENT-14, 15, 16 | 1 | ⬜ |

**Punto de atención:** los cálculos usan el ejemplo de referencia de la planificación como dato literal en los tests (80 kg, dominadas con 10 kg extra, 6 repeticiones → 90 kg, 540 kg, 1RM 108 kg). Registrar una serie tiene que llevar 10 segundos o menos (OKR O3): conviene medirlo en la demo.

**Criterio de cierre:** el alumno registra series, finaliza, ve volumen, grupos, duración y récords batidos, y carga RPE después de finalizar. El profesor quita un alumno de un plan vigente. Están los tags `v1.4.0`.

**Registro de la fase 4**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |

---

## Fase 5 — Seguimiento y cierre del MVP · v1.5.0

**Objetivo:** el profesor ve lo que hicieron sus alumnos, y el MVP queda cubierto de punta a punta con e2e, con la deuda priorizada y el informe listo.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US18 | Backend: consultar los entrenamientos de mis alumnos | back | RN-ENT-18 | 3 | ⬜ |
| 2 | US18 | Frontend: página de entrenamientos de alumnos | front | RN-ENT-18 | 3 | ⬜ |
| 2 | — | e2e de API de los flujos completos (back) | back | todas | sin estimar (margen) | ⬜ |
| 2 | — | e2e de navegador con Playwright de los flujos principales (front) | front | todas | sin estimar (margen) | ⬜ |
| 3 | — | Patches pendientes de las versiones 1.1 a 1.4 y revisión de la deuda técnica (DT-01 a DT-05) | ambos | — | sin estimar (margen) | ⬜ |
| 4 | — | Informe: matriz de trazabilidad completa, OKR con puntaje, velocity y desvío de COCOMO | ambos | — | sin estimar (margen) | ⬜ |

**Punto de atención:** las tareas sin estimar no entran en los 136 pts. En el escenario ideal no hay margen para ellas, así que se hacen en el margen del pesimista (hasta el 01/12). Si se quiere llegar al 22/11 con todo, se tienen que estimar y sumar.

**Criterio de cierre:** ninguna RN vigente sin test, cobertura dentro de los umbrales en los dos repos, e2e de los cuatro flujos (ingreso y vínculo, planificación, entrenamiento, seguimiento) en verde, los tags `v1.5.0` y, con permiso, el merge de `develop` a `main`. Si se decide declarar terminado el MVP, se evalúa con el desarrollador si corresponde publicar 2.0.0.

**Registro de la fase 5**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |
