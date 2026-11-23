# Plan de implementación por fases

Versión 2 · 02/11/2026 · Lisandro (Licha)

**Actualización de avance y estimaciones: 14/11/2026, solicitada por Martina.** Corte provisional del sprint calendario 2; cálculos y supuestos en [METRICAS-SPRINT-2.md](METRICAS-SPRINT-2.md).
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

**Estado de los sprints en Jira al 21/11/2026** (tablero CG, alineado a las fechas de este calendario)

| Sprint Jira | Fechas | Estado | Historias | Puntos V1 terminados |
| :-- | :-- | :-- | :-- | --: |
| CG Sprint 1 | 02/11 – 08/11 | Cerrado el 08/11 | T02, US00, US02, T01, US04, US05, T04, T05 | 26 |
| CG Sprint 2 | 09/11 – 15/11 | Cerrado el 21/11 (nunca se había iniciado en Jira) | US06, US07, US08, US09 Listo; T08, T09, T10 Listo | 39 (13 + 11 + 4 + 11) |
| CG Sprint 3 | 16/11 – 22/11 | Activo | US10, US20, US11, US13 Listo; US12 En curso; T06 y T07 arrastradas del sprint 2 | 25 (6 + 6 + 4 + 9) |
| CG Sprint 4 | 23/11 – 01/12 | Futuro | US14, US15, US16, US17, US18 | — |

Acumulado según Jira: **90/129 (69,8%)**; faltan 39 de US (US12 4, US14 8, US15 8, US16 11, US17 2, US18 6). **Diferencia con el código:** Jira tiene US06 en Listo, pero la edición de rutinas (RN-PLAN-07) no está implementada y Martina la había dejado parcial el 14/11; sus subtareas Backend y Frontend siguen en Por hacer en Jira. Sin US06, el acumulado es 77/129. US12 está En curso en Jira sin commits ni ramas publicadas al 21/11.

**Reestimación vigente al 14/11/2026.** La base original sigue en 129 puntos; hay 52 puntos técnicos acumulados y 26 corresponden al sprint 2 abierto. US06 sigue parcial por edición pendiente, confirmado por Martina. Fase 2: 15/28 puntos de historias completas; US09 adelanta 11 de la fase 3. No hay registro de horas efectivas ni un cierre formal del sprint; las horas y la velocity formal quedan ND.

En las tablas de tareas de US se conserva la columna de puntos de V1; los cambios de residual se indican en el estado y se detallan en el informe. Las filas de cierre llevan su cifra V2 explícita.

El residual V2 es **74 puntos de US + 17 de cierre = 91**. Los 17 incluyen regularización del trabajo ya implementado y los flujos finales/informe antes sin estimar, sin duplicar los tests ordinarios de las US. Los puntos de historias ya realizadas no se modifican retroactivamente.

| Escenario condicional | Capacidad supuesta | Fin funcional de las US | Fin con cierre |
| :-- | --: | :-- | :-- |
| Favorable | 37 pts/semana, referencia histórica no garantizada | 28/11 | 02/12 |
| Central provisional | 26 pts/semana, repetición del avance técnico ya acumulado en este sprint parcial | 04/12 | 09/12 |
| Conservador | 20 pts/semana, hipótesis de menor capacidad | 10/12 | 16/12 |

Se cuentan días calendario desde el 15/11 y se redondea hacia arriba. Son pronósticos de capacidad, no fechas acordadas ni percentiles estadísticos. Para terminar los 91 puntos al 22/11 harían falta 79,6 pts/semana; al 01/12, 37,5. La afirmación del 08/11 de llegada «con holgura» queda sustituida por esta revisión. No se recortó ninguna US ni se autorizó modificar `main`.

**Control respecto de las metas anteriores**

| Corte | Acumulado ideal anterior | Acumulado pesimista anterior | Real / estado |
| :-- | --: | --: | :-- |
| 08/11 | 45 | 37 | 26 según el registro histórico |
| 14/11, provisional | — | — | 52 técnicos acumulados |
| 15/11 | 78 | 63 | **65 según Jira** (Sprint 2 cerrado): −13 frente a la ideal, +2 frente a la pesimista. 52 si US06 se cuenta parcial |
| 22/11 | 129 | 100 | **90 al 21/11 según Jira** (Sprint 3 activo): −39 frente a la ideal, −10 frente a la pesimista. El ideal ya no se alcanza |
| 28/11 | — | 129 | Sin resultado real aún |
| 01/12 | — | Margen anterior | Objetivo conservado; requiere revisar capacidad o alcance |

El cierre del 15/11 debe distinguir implementación técnica, cumplimiento de DoD e integración/publicación. La lista de compromiso semanal y el estado del tablero no se verificaron; no se inventa un porcentaje de cumplimiento semanal.

## Resumen

Actualizado al corte del 14/11/2026. **Al 21/11, según Jira:** fase 2 con 28/28 (US06 en Listo, edición sin código), fase 3 con 36/36, fase 4 con US12 en curso y fase 5 sin empezar; 90/129 acumulados. Ninguna minor publicada: los dos repos siguen en 1.1.0.

| Fase | Versión prevista | Base V1 | Implementado V1 | Residual V2 | Pronóstico central | Estado observado |
| :-- | :-- | --: | --: | --: | :-- | :-- |
| 0. Base técnica | 1.0.0 | 4 | 4 | 0 | Registro: 02/11 | Implementada según registro histórico |
| 1. Ingreso, catálogo y vínculo | 1.1.0 | 22 | 22 | 0 | Registro: 08/11 | Tag v1.1.0 verificado localmente; demo no medida |
| 2. Planificación básica | 1.2.0 | 28 | 15 | 9 | 17/11 | US06 parcial; US07 y US08 técnicas completas; incluye 3 de regularización |
| 3. Más rutinas e inicio del entrenamiento | 1.3.0 | 36 | 11 | 29 | 25/11 | US09 implementada; demás historias pendientes |
| 4. Registro, resumen y récords | 1.4.0 | 33 | 0 | 33 | 04/12 | Pendiente |
| 5. Seguimiento y cierre | 1.5.0 | 6 | 0 | 20 | 09/12 | US18 6 + cierre global 14 |
| **Total** | | **129** | **52** | **91** | | V1 y residual V2 son contabilidades distintas |

Las fechas centrales suponen fases consecutivas y 26 pts/semana. El residual se reconcilia así: 77 nominales − 7 de reutilización en US06 + 2 de US10 + 2 de US13 + 17 de cierre = 91. Las estimaciones anteriores del 08/11 quedan conservadas en la planificación histórica y comparadas en el informe de métricas. Los objetivos de no tocar `main` antes del 22/11 y de pedir autorización para publicar se mantienen.

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
| 2 | US00 | Frontend: página de ingreso, sesión y rutas por rol | front | RN-IDE-01, 02, 03 · RN-UI-IDE-01, 02 | 3 | ✅ |
| 2 | US02 | Backend: dar de alta un profesor | back | RN-IDE-04, 06, 13 | 1 | ✅ |
| 2 | ~~US01~~ | ~~Backend: registrar ejercicio~~ | ~~back~~ | ~~RN-CAT-01…07~~ | ~~3~~ | — fuera del MVP (DT-06) |
| 2 | T01 | Carga del dataset de ejercicios (idempotente, `yarn seed`) | back | RN-CAT-01, 05, 07, 08, 09 | 3 | ✅ |
| 3 | US02 | Frontend: página de alta de profesor | front | RN-IDE-04, 06, 13 | 1 | ✅ |
| 3 | ~~US01~~ | ~~Frontend: página de registro de ejercicio~~ | ~~front~~ | ~~RN-CAT-01…07~~ | ~~3~~ | — fuera del MVP (DT-06) |
| 3 | US04 | Modelar: Código de Profesor | back | RN-IDE-08 | 1 | ✅ |
| 4 | US04 | Backend y Frontend: generar código de profesor | ambos | RN-IDE-08 | 2 | ✅ |
| 5 | US05 | Backend: vincular alumno con el código | back | RN-IDE-09, 10, 11 | 3 | ✅ |
| 6 | US05 | Frontend: página para vincularse con el profesor | front | RN-IDE-09, 10, 11 | 1 | ✅ |
| 7 | T01 | Frontend: lista de ejercicios con buscador, detalle con GIF y registro deshabilitado (DT-06) | front | RN-CAT-01, 05, 09 | incl. en T01 | ✅ |
| 8 | T04 | Reestimación del backlog y del calendario | ambos (docs) | — | 1 | ✅ |
| 8 | T05 | Ajuste de métricas (pts por hora de sesión, OKR, COCOMO) | ambos (docs) | — | 1 | ✅ |

**Ejemplo de microcommits para US05 (backend).** El pie `Reglas:` se muestra en la misma línea para abreviar; en el commit real va al final del mensaje.

```
feat(identidad): rechazo un código de profesor inexistente [US05]        Reglas: RN-IDE-11
feat(identidad): vinculo al alumno con el profesor del código [US05]     Reglas: RN-IDE-09
feat(identidad): rechazo el vínculo de un alumno que ya tiene profesor [US05]  Reglas: RN-IDE-10
feat(identidad): rechazo un código invalidado por regeneración [US05]   Reglas: RN-IDE-11
refactor(identidad): extraigo la búsqueda de código al repositorio [US05]
feat(identidad): expongo POST /identidad/alumnos/vinculo con guard de Alumno [US05]
test(identidad): cubro el vínculo con e2e de API [US05]                 Reglas: RN-IDE-03, 09, 10
US05 — Vincular alumno con su profesor   (merge --no-ff)
```

**Criterio de cierre:** la demo pasa de punta a punta en el navegador: el catálogo se carga desde el dataset, el Admin ingresa y da de alta un profesor, el profesor genera su código, y un alumno de la semilla ingresa y se vincula. Están los tags `v1.1.0` en los dos repos.

**Registro de la fase 1**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| dom 08/11, 15:10 | dom 08/11, 16:30 | 22 (20 + T04 y T05) | ≈ 1,3 h de sesión con IA (Opus 5.5 + Sonnet 5.5 + Haiku 5.5), incluidas las confirmaciones de fichas | +1 día contra el ideal, 0 contra el pesimista. Esfuerzo: ≈ 17 pts/h (base nueva, decisión 42) | Pendiente (falta la demo) | Decisión 41: US01 fuera del MVP y T01 como dataset de ejercicios. 141 tests en total (113 back, 28 front). Antes del 08/11 no hubo implementación |

---

## Fase 2 — Planificación básica · v1.2.0

**Objetivo:** el profesor arma una rutina por bloques y un plan de 28 días, y el alumno ve qué le toca hoy.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US06 | Modelar: Rutina, Bloque, Ejercicio Prescripto, Pausa | back | RN-PLAN-01, 02, 04, 05, 06, 07 | 3 | ✅ modelado de creación; RN-PLAN-07 pendiente de edición |
| 2 | US06 | Backend: crear y editar una rutina por bloques | back | RN-PLAN-01, 02, 04, 05, 06, 07 | 5 | 🔄 creación implementada; edición pendiente (residual back V2: 3) |
| 2 | US07 | Modelar: Plan de Entrenamiento, Validez del plan, Día del plan | back | RN-PLAN-09…15, 17 | 3 | 🟩 |
| 3 | US06 | Frontend: editor de rutina (bloques) | front | RN-PLAN-01, 02, 04, 05, 06, 07 | 5 | 🔄 creación implementada; edición pendiente (residual front V2: 3) |
| 3 | US07 | Backend: crear plan con alumnos y una rutina o descanso por día | back | RN-PLAN-09…15, 17 | 5 | 🟩 |
| 4 | US07 | Frontend: página de creación de plan | front | RN-PLAN-09…15, 17 | 3 | 🟩 |
| 4 | US08 | Backend: consultar la rutina del día | back | RN-PLAN-11, 15, 18 | 1 | 🟩 |
| 5 | US08 | Frontend: página de la rutina del día | front | RN-PLAN-11, 15, 18 | 3 | 🟩 |

**Punto de atención:** el editor de rutina es la pantalla más compleja del proyecto (COCOMO: 2 puntos de aplicación). Conviene armarlo para que la fase 3 le sume circuitos sin reescribirlo.

**Criterio de cierre:** el profesor crea una rutina, arma un plan de 28 días con un alumno vinculado y descansos, y el alumno ve la rutina de hoy. Un alumno con plan vigente no se puede asignar a otro plan (RN-PLAN-12). Están los tags `v1.2.0`.

**Registro de la fase 2**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Back de creación: 08–09/11; front: 10/11 según cierres Git | Fase abierta al 14/11; US08 verificada el 14/11 | 15/28 de historias completas; US06 parcial | ND: sin registro efectivo | US08: +1 día frente al 13/11 informado; fase sin desvío final medible | ND | Sprint calendario 2 lleva 26 pts al incluir US09 de fase 3; integración/publicación y edición pendientes |
| — | Sprint 2 cerrado en Jira el 21/11 con fecha de fin 15/11 | 28/28 según Jira (US06 13, US07 11, US08 4); US07 y US08 integradas en develop el 14–15/11 | ND | — | ND | US06 figura Listo en Jira, pero la edición (RN-PLAN-07) no tiene código: decidir si se reabre o se acepta sin edición. Tag `v1.2.0` sin publicar |

---

## Fase 3 — Más rutinas e inicio del entrenamiento · v1.3.0

**Objetivo:** rutinas por circuitos y mixtas, reutilizar rutinas, ver el plan completo y empezar a entrenar.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US09 | Modelar: Circuito (2 o más ejercicios, macropausa por vuelta) | back | RN-PLAN-01, 03, 04 | 3 | ✅ implementado e integrado; evidencia de pruebas en auditoría |
| 1 | US11 | Backend: consultar el plan del alumno | back | RN-PLAN-11, 19 | 1 | ✅ integrado en develop el 19/11 (Martina); 10 unitarios y 9 e2e API |
| 1 | US13 | Modelar: Entrenamiento (copia de la rutina, peso del día, abandonado) | back | RN-ENT-01, 02, 20 | 3 | ✅ integrado en develop el 20/11 (Julián, CG-46) |
| 2 | US09 | Backend: crear rutina por circuitos | back | RN-PLAN-01, 03, 04 | 5 | ✅ implementado e integrado; evidencia de pruebas en auditoría |
| 2 | US11 | Frontend: página "Mi plan" | front | RN-PLAN-11, 19 | 3 | ✅ integrado en develop el 19/11 (Martina); 9 Vitest |
| 2 | US13 | Backend: iniciar entrenamiento y consultar el que está en curso | back | RN-ENT-01, 02, 20 | 3 | ✅ integrado en develop el 20/11 (Julián, CG-46) |
| 3 | US09 | Frontend: circuitos en el editor de rutina | front | RN-PLAN-01, 03, 04 | 3 | ✅ implementado e integrado; evidencia de pruebas en auditoría |
| 3 | US10 | Backend: rutina mixta | back | RN-PLAN-01 | 3 | ✅ integrado en develop el 15/11 (Ignacio, PR #5) |
| 3 | US20 | Backend: importar rutina (copia, solo las propias) | back | RN-PLAN-08 | 3 | ✅ integrado en develop el 17/11 (Julián, CG-40) |
| 3 | US13 | Frontend: página del entrenamiento en curso (inicio y contador) | front | RN-ENT-01, 02, 20 · RN-UI-ENT-02 | 3 | ✅ integrado en develop el 20/11 (Julián, CG-46) |
| 4 | US10 | Frontend: rutina mixta en el editor | front | RN-PLAN-01 | 3 | ✅ integrado en develop el 15/11 (Ignacio, PR #4) |
| 4 | US20 | Frontend: importar desde el listado de rutinas | front | RN-PLAN-08 | 3 | ✅ integrado en develop el 17/11 (Julián, CG-40) |

**Punto de atención:** es la fase más cargada (36 pts) y cruza el corte del 15/11. El corte vigente compara con la meta pesimista del 15/11 de 63 acumulados; al 14/11 hay 52. US20 sigue como candidata a postergar, sin aplicar un recorte automático.

**Criterio de cierre:** el profesor arma una rutina mixta e importa una rutina a otro plan. El alumno ve sus 28 días e inicia el entrenamiento de hoy, y no puede iniciar otro el mismo día (RN-ENT-01). Están los tags `v1.3.0`.

**Registro de la fase 3**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| US09: cierres del 10/11 | Fase abierta al 14/11 | 11/36 originales por US09 | ND | No se cerró la fase | ND | Residual V2: 29 (US10 8, US20 6, US11 4, US13 11); pronóstico central 25/11 |
| US10 15/11; US20 17/11; US11 19/11 | 20/11 (US13 integrada) | **36/36** según Jira y develop | ND | Terminada el 20/11, dentro del Sprint 3 (16–22/11), 5 días antes del pronóstico central del 25/11 | ND | Falta para cerrar el hito: demo, tag `v1.3.0` (y antes `v1.2.0`) y decidir US06 |

---

## Fase 4 — Registro, resumen y récords · v1.4.0

**Objetivo:** el alumno registra lo que hizo, ve su resumen y sus récords, y el profesor ajusta los alumnos del plan vigente.

| Orden | Tarjeta | Tarea | Repo | RN | Pts | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | US14 | Backend: registrar serie realizada | back | RN-ENT-03, 04, 19, 20 | 3 | ⬜ |
| 1 | US16 | Modelar: Récord Personal y Carga Efectiva (Estrategia por tipo de carga, Epley) | back | RN-ENT-10, 11, 12, 13 | 5 | ⬜ |
| 1 | US12 | Backend: agregar y quitar alumnos de un plan vigente | back | RN-PLAN-12, 13, 14, 16 | 3 | 🔄 En curso en Jira (Martina, Sprint 3); sin commits al 21/11 |
| 2 | US14 | Frontend: registro de series en el entrenamiento en curso | front | RN-ENT-03, 04, 19, 20 · RN-UI-ENT-01 | 5 | ✅ 22/11 (rama `feat/US14-registrar-serie`) |
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
| 2 | US18 | Frontend: página de entrenamientos de alumnos | front | RN-ENT-18 | 3 | ✅ 23/11 (rama `feat/US18-entrenamientos-de-alumnos`) |
| 2 | — | e2e de API de los flujos completos (back) | back | todas | 3 (V2) | ⬜ |
| 2 | — | e2e de navegador con Playwright de los flujos principales (front) | front | todas | 5 (V2) | ⬜ |
| 3 | — | Patches pendientes y revisión final de calidad | ambos | — | 3 (V2; reserva) | ⬜ |
| 4 | — | Informe, matriz, métricas y cierres de versión futuros | ambos | — | 3 (V2) | ⬜ |

**Punto de atención actualizado:** el cierre global antes sin estimar suma 14 puntos V2 (3 + 5 + 3 + 3). Se agregan 3 de regularización actual en el residual de fase 2, total 17. No se duplican los tests y revisión ordinaria de cada US ni se contabilizan dos veces en los pronósticos. No se implementa la deuda DT-01 a DT-05 dentro de esta reserva; solamente se revisa y prioriza.

**Criterio de cierre:** ninguna RN vigente sin test, cobertura dentro de los umbrales en los dos repos, e2e de los cuatro flujos (ingreso y vínculo, planificación, entrenamiento, seguimiento) en verde, los tags `v1.5.0` y, con permiso, el merge de `develop` a `main`. Si se decide declarar terminado el MVP, se evalúa con el desarrollador si corresponde publicar 2.0.0.

**Registro de la fase 5**

| Inicio real | Fin real | Puntos terminados | Horas reales | Desvío | Bugs en demo | Notas |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |
