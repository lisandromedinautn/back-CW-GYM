# Auditoría de IA — back-CW-GYM

Registro de cada sesión relevante en la que un desarrollador trabajó con IA. Deja claro qué hizo la IA, qué decidió el desarrollador y qué ideas se descartaron. Si una sesión tocó los dos repos, la entrada va en ambos.

## Formato de entrada

```
## AAAA-MM-DD — <título corto> [<ID tarjeta>]
- Desarrollador: <nombre>
- Herramienta / modelo / esfuerzo: <p. ej. Claude Code · Opus 5.5 medio (orquestador) + Haiku 5.5 low (2 subagentes)>
- Objetivo: <qué se buscaba>
- Qué hizo la IA: <archivos, propuestas, tests>
- Decisiones del desarrollador: <qué eligió y por qué>
- Ideas descartadas: <qué se propuso y no se usó, y por qué>
- Reglas afectadas: <RN-... creadas/cambiadas, o "ninguna">
- Pendientes: <lo que queda abierto>
```

---

## 2026-11-01 — Planificación inicial, convenciones y esqueleto documental [T03]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, sin subagentes)
- Objetivo: actualizar el documento de planificación, fijar las convenciones del proyecto y crear el esqueleto de los dos repos sin código.
- Qué hizo la IA: preguntó 24 dudas de convenciones. Actualizó la planificación en `docs/PLANIFICACION.md` (el Google Doc original no se pudo editar porque no hay conector de Google Docs). Redactó el catálogo de reglas de negocio con IDs en el `CLAUDE.md` de cada módulo, el `CLAUDE.md` global, `ATLAS.md`, `docs/TESTING.md`, `docs/TRAZABILIDAD.md` y `docs/MODELOS-IA.md`. Creó la estructura de carpetas vacía, instaló las skills `tdd` y `coverage` (después de revisar su contenido) y configuró `.claude/settings.json`. Detectó 13 zonas grises (ZG-01 a ZG-13).
- Decisiones del desarrollador: dos repos separados; arquitectura modular sin services, un caso de uso por archivo, entidades ricas y repositorios como puertos; NestJS + TypeORM + Postgres; React + Vite con Vitest; Yarn 1 (no Yarn 4); JWT con guard por rol; todo en español; e2e de API en el back y e2e de navegador con Playwright en el front (se configura al crear la suite); base de test dockerizada independiente; cobertura de dominio 80% y resto 70%; protección de tests por permisos; auditoría en `DECISIONES-IA.md`; Sonnet y Haiku siempre en low, delegación priorizada y confirmada por consola; rutinas sin bloqueo; sensación de fuerza de 1 a 5; matriz de trazabilidad obligatoria; ramas `main` y `develop` con commits directos a `develop` protegidos por hooks.
- Ideas descartadas: Yarn 4 con `npmMinimalAgeGate` (se mantiene Yarn 1; la regla de las 24 h se cumple con verificación manual y un script en T02). Monorepo. Feature branches obligatorias. Bloqueo de rutinas ya entrenadas. Autogenerar tests con la skill `coverage` (`/pw:generate`).
- Reglas afectadas: se crearon RN-IDE-01…12, RN-CAT-01…07, RN-PLAN-01…19 y RN-ENT-01…19.
- Pendientes: decidir ZG-01 a ZG-13 (`docs/PLANIFICACION.md`). Setup técnico en T02.

## 2026-11-01 — Cierre de zonas grises y e2e con Playwright [T03]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, sin subagentes)
- Objetivo: decidir las 13 zonas grises detectadas al armar el catálogo de reglas y sumar Playwright al front.
- Qué hizo la IA: presentó las ZG-01 a ZG-13 y dos dudas extra (mínimo de ejercicios por circuito, quitar al último alumno del plan), con una opción recomendada en cada una. Aplicó las respuestas en los `CLAUDE.md` de los módulos de los dos repos, en `docs/PLANIFICACION.md` (decisiones 24 a 36), en `docs/TRAZABILIDAD.md` y en los atlas. Detectó que "un plan no puede finalizarse antes" contradecía US19 y lo consultó. Registró Playwright en la planificación, el protocolo de testing, el atlas y los permisos del front.
- Decisiones del desarrollador: se ingresa con email y contraseña, y el dataset trae la contraseña inicial; legajo y documento únicos; código de profesor reutilizable y sin vencimiento, que se invalida al regenerarlo; factor de peso mayor que 0% y hasta 100%; lista cerrada de músculos (agregó Sóleo); nombre de ejercicio único y secundario opcional; cada profesor trabaja solo con sus propias rutinas; un plan no se finaliza antes de tiempo, así que se elimina US19 (el backlog queda en 136 pts); solo se entrena la rutina de hoy, una vez por día; los grupos trabajados incluyen al músculo secundario; un récord se bate solo con una marca estrictamente mayor, y la primera marca no se anuncia; RPE y sensación son opcionales y se pueden cargar después; un entrenamiento sin finalizar queda abandonado a la medianoche; un circuito tiene 2 o más ejercicios; un plan vigente puede quedar sin alumnos. Playwright para los e2e del front, a configurar al crear la suite de tests.
- Ideas descartadas: finalización anticipada del plan (US19). Pasar US19 a deuda técnica. Código de profesor de un solo uso o con vencimiento. Anunciar empates o la primera marca como récord. RPE obligatorio.
- Reglas afectadas: RN-IDE-01, 04, 06, 08, 11, 12; nueva RN-IDE-13. RN-CAT-01, 04, 05, 07. RN-PLAN-03, 08, 12, 15, 16, 17. RN-ENT-01, 09, 13, 16; nueva RN-ENT-20. Front: RN-UI-ENT-02 pasa a vigente.
- Pendientes: tarjeta US19 a eliminar en Trello. Setup técnico en T02 (incluye Playwright). Google Doc a sincronizar cuando esté el conector de Docs.

## 2026-11-02 — Microcommits, versionado y plan de implementación por fases [T03]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, sin subagentes)
- Objetivo: sumar a la planificación la regla de microcommits para la trazabilidad, definir el versionado del sistema y armar un plan de implementación por fases.
- Qué hizo la IA: detectó tres conflictos y los consultó: los módulos no coinciden con los sprints; con commits de TDD en rojo, husky los bloquea; y main solo se toca al cierre del sprint. Pasó `docs/PLANIFICACION.md` a la v3 (decisiones 37 y 38, secciones "Microcommits y trazabilidad" y "Versionado del sistema"). Creó `docs/PLAN-IMPLEMENTACION.md`, con las fases 0 a 5, el orden de dependencias, las RN por tarea, la definición de terminado y el registro de avance. Actualizó la sección Git del `CLAUDE.md` y la leyenda de la matriz. Detectó la zona gris ZG-14 (cómo se crea el Admin).
- Decisiones del desarrollador: SemVer en 1.x mientras dure el MVP. La minor sube por hito funcional (un sprint): 1.0.0 es la base técnica (T02) y de 1.1.0 a 1.5.0 son los sprints 1 a 5. El patch sube con los arreglos, y una US suelta no sube versión. Front y back sincronizados (misma MAJOR.MINOR; el patch puede diferir). Microcommits con test e implementación juntos y el refactor aparte. Plan en un archivo nuevo, con una fase por versión.
- Ideas descartadas: minor por módulo DDD completo (Planificación cerraría recién en el sprint 4). Patch por cada US terminada (mezcla features con arreglos). Commit del rojo con `--no-verify`, o permitir rojo en la subrama. Versiones independientes por repo. Plan dentro de `PLANIFICACION.md`.
- Reglas afectadas: ninguna RN. Nuevas decisiones 37 y 38. ZG-14 abierta.
- Pendientes: decidir ZG-14 antes de US00. Confirmar la tarjeta de Trello de este cambio. Confirmar las fechas de los sprints. Sincronizar el Google Doc. La fase 0 suma a T02 el hook `commit-msg`, `CHANGELOG.md` y la versión 1.0.0.

## 2026-11-02 — Calendario en dos escenarios, regla de main y seed del Admin [T03]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, sin subagentes)
- Objetivo: ajustar el calendario a la fecha objetivo, congelar `main` hasta la entrega, decidir cómo se crea el Admin y obtener las tarjetas para el tablero.
- Qué hizo la IA: recalculó las fechas de cada fase para los dos escenarios y documentó que la velocity histórica (37) no alcanza para el ideal (hace falta 45,3 pts/semana). Agregó los cortes de control por sprint y el orden de recorte. Pasó los tags de versión a `develop` y redefinió la minor por fase en lugar de por sprint. Registró RN-IDE-14 y el caso de uso `sembrar-admin`. Generó la lista de tarjetas para Trello y un CSV de importación para Jira (fuera del repo).
- Decisiones del desarrollador: escenario ideal al 22/11 y pesimista al 01/12, dejando documentado que la velocity no da para el ideal. `main` no se toca hasta el 22/11. Tags en `develop`. El Admin se crea con un seed (ZG-14). Tarjetas a mano en Trello, con Jira como alternativa.
- Ideas descartadas: recortar el alcance de entrada para llegar al 22/11. Cargar los 136 pts con más ritmo como compromiso. Publicar sin tags hasta el 22/11. Script por la API de Trello o CSV para power-ups.
- Reglas afectadas: nueva RN-IDE-14. Decisiones 38 (ajustada), 39 y 40.
- Pendientes: crear las tarjetas en Trello (o importarlas a Jira). Sincronizar el Google Doc. Implementar la infraestructura de seeds en T02 y el seed del Admin en US00.

## 2026-11-02 — Base técnica del proyecto (T02) y versión 1.0.0 [T02]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, sin subagentes: el setup es secuencial y cada paso depende del anterior)
- Objetivo: dejar la base técnica de T02 en los dos repos para que el equipo arranque con las historias.
- Qué hizo la IA: eligió cada versión con un script que toma la última estable publicada hace más de 24 h. Revisó los avisos de seguridad de Playwright: la 1.64.1 no tiene ninguno, y lo de hoy es una alfa. Detectó que Nest 12 es solo ESM y que su base oficial usa Vitest, y que el Node local (22.14) no alcanzaba para lint-staged, jsdom ni la CLI de Nest. Instaló Node 24.22.2 verificando el SHA-256 del instalador. Armó en el back Nest 12 + TypeORM + Postgres 18 dockerizado (5442 y 5443), Vitest en tres niveles con umbrales, ESLint con las reglas de capas del `CLAUDE.md`, la prohibición de only/skip/todo, husky, lint-staged, el validador de mensajes, el script de antigüedad de paquetes (directas y transitivas nuevas) y la infraestructura de `yarn seed`. En el front armó React 19 + Vite 8, Vitest + Testing Library + MSW, Playwright y las mismas herramientas. Verificó con pruebas descartables, borradas antes de commitear: la inyección de dependencias por tipo con Vitest, que el umbral de dominio bloquea, que un test en rojo y un mensaje mal formado bloquean el commit, que cada regla de capas da error y que MSW rechaza las requests no declaradas. El verificador encontró 7 transitivas con menos de 24 h (semver, strtok3, token-types, baseline-browser-mapping y electron-to-chromium), que se fijaron con `resolutions`.
- Decisiones del desarrollador: Nest 12 + Vitest en el back (cambia la decisión 21). Node 24 LTS. Revisar las vulnerabilidades de Playwright antes de instalarlo.
- Ideas descartadas: Jest con ESM experimental. Nest 11 con Jest. Node 26 (LTS recién estrenada) y Node 22. Bajar herramientas para seguir en Node 22.14. Escribir un smoke test sin regla de negocio. Implementar ya `ErrorDominio` y el filtro sin un test que los justifique.
- Reglas afectadas: ninguna RN. Decisiones 17 y 21 actualizadas.
- Pendientes: la API de una prueba quedó corriendo en el puerto 3000 (PID 17824) y hay que cerrarla a mano. Playwright necesita `yarn playwright install chromium` una vez por máquina. Las `resolutions` se pueden quitar cuando esas versiones superen las 24 h. Cada integrante tiene que instalar Node 24.

## 2026-11-08 — Decisión 41: US01 fuera del MVP, catálogo por dataset y semilla de usuarios [T01]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Haiku 5.5 (subagente de documentación)
- Objetivo: actualizar la documentación al cambio de alcance: US01 pasa a DT-06, T01 carga el dataset de ejercicios y los alumnos y profesores de prueba salen de una semilla de usuarios.
- Qué hizo la IA: actualizó `docs/PLANIFICACION.md` (decisiones 1, 24, 25 y 41, DT-01, DT-03 y DT-06, backlog de 127 pts), `docs/PLAN-IMPLEMENTACION.md` (fase 1 en 20 pts y fila de la semilla de usuarios), `docs/TRAZABILIDAD.md`, y el atlas y el CLAUDE.md global de cada repo. En el front, las reglas de UI del catálogo (RN-CAT-01, 05 y 09) y su historial. Actualizó las tarjetas de Trello y el CSV de Jira, fuera de los repos. No tocó código ni tests, y no commiteó.
- Decisiones del desarrollador: US01 sale del MVP y pasa a DT-06 (el catálogo del MVP se carga desde un dataset). T01 pasa a ser la carga del dataset de ejercicios (hasaneyldrm/exercises-dataset, 1324 ejercicios). Los alumnos y profesores de prueba se crean con la semilla de usuarios dentro de US00. Las tablas de velocity y calendario no se recalculan: el recorte deja 9 pts de margen.
- Ideas descartadas: no se registraron en esta sesión.
- Reglas afectadas: RN-CAT-01, 05 y 07 cambiadas; nuevas RN-CAT-08 y 09. RN-IDE-05 y 12 cambiadas; RN-IDE-06, 07 y 13 pasan a la semilla de usuarios de US00. Los textos salen de la rama `feat/T01-dataset-ejercicios` (commit 0a69b7b), porque no están en `docs/T01-alcance`.
- Pendientes: llevar a `docs/T01-alcance` las reglas de catálogo e identidad de la rama T01 (el worktree de este cambio no las tiene). Definir si la semilla de usuarios tiene puntos propios o va dentro de los 5 pts de US00 backend. Revisar ZG-13, que es texto histórico y dice "dataset".

## 2026-11-08 — Backend de la fase 1: US00, T01, US02, US04 y US05 [US00, T01, US02, US04, US05]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador) + Sonnet 5.5 (T01) + Haiku 5.5 (documentación y tests del front)
- Objetivo: cerrar el backend de la fase 1: ingreso y semilla de usuarios (US00), carga del dataset de ejercicios (T01), alta de profesores (US02), código de profesor (US04) y vínculo del alumno con su profesor (US05).
- Qué hizo la IA: implementó con TDD por regla: primero el test en rojo por aserción y después el código, y verificó cada test por mutación (al romper la regla, el test tiene que fallar). Creó los casos de uso, los puertos, el evento `AlumnoVinculado`, el publicador de eventos de log y los endpoints. Documentó cada tarjeta en las fichas de test, la trazabilidad, el atlas, los `CLAUDE.md` de los módulos, el CHANGELOG y el plan de implementación. Estado de develop: 113 tests, 99,2% de líneas (unitarios, integración y e2e).
- Decisiones del desarrollador: las fichas (entrada y esperado) se confirmaron por tarjeta antes de escribir cada test. Decisión 41: US01 fuera del MVP, catálogo cargado desde el dataset de ejercicios y alumnos y profesores de prueba desde la semilla de usuarios. Lista de músculos ampliada. Nombres de ejercicios en inglés y GIF enlazado con la atribución de Gym visual. Cobertura medida con unitarios, integración y e2e juntos. Se quitaron los 4 tests sin regla de negocio que había agregado Sonnet. Los archivos de catálogo se renombraron con los sufijos del atlas. Los tests del front los escribió Haiku y los implementó Sonnet.
- Ideas descartadas: medir solo unitarios. Excluir la infraestructura del umbral de cobertura. Guardar un historial de códigos de profesor (se usa una columna única que se reemplaza). Bus de eventos (se deja un publicador de log hasta que haya un suscriptor).
- Reglas afectadas: ninguna regla cambiada en esta sesión. Tests nuevos para RN-IDE-04, 06, 08, 09, 10, 11 y 13, y e2e para RN-CAT-01 y 05.
- Pendientes: no verificado: la carga real de los GIFs en el navegador, la concurrencia en la semilla (no usa transacción) y la unicidad del documento entre tablas, que solo controla la aplicación.

## 2026-11-08 — Reestimación del backlog y ajuste de métricas [T04, T05]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: reevaluar las métricas y las estimaciones con los datos reales de la fase 1 y crear estimaciones nuevas para lo que falta.
- Qué hizo la IA: midió la sesión del 08/11 con los commits de los dos repos (22 pts en ≈ 1,3 h de sesión, ≈ 17 pts/h). Propuso medir puntos por hora de sesión y horas de sesión por semana (decisión 42), con un factor de complejidad de 2 a 2,5 para las fases 2 a 4 (7,5 pts/h estimados, unas 14 h de sesión para los 103 pts restantes). Recalculó los cortes de control y las fechas de cada fase (ideal 22/11; pesimista 28/11 con margen al 01/12), completó el registro de la fase 1 y el estado de los OKR, y comparó con COCOMO II (sobreestima unas 12 veces con IA). Actualizó `JIRA-IMPORT.csv` y `TARJETAS-TRELLO.md` (fuera de los repos): quitó US01, sumó T04 y T05 y agregó el estado real de cada tarjeta.
- Decisiones del desarrollador: crear las tarjetas T04 (reestimación) y T05 (ajuste de métricas) y eliminar del tablero la tarjeta del alta de ejercicios. Aclaró que la implementación arrancó el 08/11, así que no hay horas de trabajo anteriores para comparar.
- Ideas descartadas: seguir midiendo solo pts/semana (con un único día de trabajo en el sprint 1, el número no dice nada del ritmo). Recortar alcance ya (lo real quedó debajo de la línea pesimista original, pero el ritmo medido no lo justifica: se revisa en el corte del 15/11).
- Reglas afectadas: ninguna RN. Decisión 42 nueva; backlog de 127 a 129 pts.
- Pendientes: el factor de complejidad (2 a 2,5) es una suposición: se valida al cerrar la fase 2. La decisión de no recortar es una propuesta que tiene que confirmar el desarrollador. No se pudo cargar Jira directo: el conector de Claude no tiene permiso sobre `lichimedina05.atlassian.net`.

## 2026-11-08 — Ajustes después de la fase 1: brecha de US02, regla de hooks en español, 404 sin regla y Jira [US00, US02, US05]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: resolver lo que quedó abierto al cerrar la fase 1.
- Qué hizo la IA: (front) sumó el test "Legajo de solo espacios no se envía" (RN-IDE-04), que mata la mutación del `trim` que antes sobrevivía; escribió la regla local de ESLint `cwgym-hooks/reglas-de-hooks` (`eslint/reglas-de-hooks.js`), que aplica las reglas de los hooks a `use*` y `usar*` y la verificó con un archivo temporal con 5 violaciones (todas detectadas). (back) El 404 de "profesor o alumno no encontrado" usa el código técnico `NO-ENCONTRADO` en lugar de RN-IDE-08/09. (Jira, proyecto CG en lichimedina05.atlassian.net) actualizó T01 y US00, creó T04 (CG-69) y T05 (CG-70) con sus subtareas, pasó a Listo lo terminado en la sesión y marcó US01 (CG-6 a CG-9) como descartada.
- Decisiones del desarrollador: cerrar la brecha, crear una regla de lint propia en lugar de nombrar los hooks en inglés, usar `NO-ENCONTRADO` para el 404 sin regla, aceptar los casos agregados a las fichas (token inválido, DNI de alumno en el alta de profesor, email y DNI de profesor en la semilla). Los commits firmados como PIPICBA / lichimedina05 son suyos.
- Ideas descartadas: renombrar los hooks a `use*` (rompe la regla de idioma); dejar la regla de React apagada sin reemplazo.
- Reglas afectadas: ninguna RN cambia. Contrato de errores: excepción `NO-ENCONTRADO` documentada en `src/compartido/CLAUDE.md` del back.
- Pendientes: borrar a mano US01 (CG-6 a CG-9) en Jira, porque el conector no puede borrar issues; cargar los Story Points de T04 y T05 desde la UI (el campo no está en la pantalla de creación); la regla de hooks no analiza returns anticipados; la demo de la fase 1 y el tag v1.1.0.

## 2026-11-08 — Carpetas por concepto en dominio y aplicación [T05]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: que `dominio/` y `aplicacion/` no muestren decenas de archivos sueltos.
- Qué hizo la IA: movió con `git mv` 49 archivos de catálogo e identidad a una carpeta por concepto (entidad o valor con su spec y sus puertos; un caso de uso por carpeta) con un script que recalculó todos los imports relativos de `src/` y `test/`; actualizó las rutas en fichas, trazabilidad y atlas, y documentó la convención en `ATLAS.md` ("Carpetas por concepto"). Verificó tsc, lint, Prettier y las tres suites (113 tests, 99,2%). El pre-commit falló con "La línea de comandos es demasiado larga" (límite de 8191 caracteres de `cmd` en Windows con unos 70 archivos staged): se agregó `--max-arg-length 6000` a `.husky/pre-commit` para que lint-staged parta la lista en tandas, sin saltear el hook.
- Decisiones del desarrollador: agrupar por concepto.
- Ideas descartadas: dos commits por módulo (`src/semillas.ts` importa de los dos y uno de ellos no compilaba solo); usar `--no-verify` (prohibido).
- Reglas afectadas: ninguna. Los spec solo cambian rutas de import.
- Pendientes: el front todavía tiene pocos archivos por capa; se agrupa cuando crezca. `infraestructura/` y `presentacion/` siguen planas.

## 2026-11-08 — Carpetas por concepto en infraestructura, presentación, compartido y el front [T05]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: extender las carpetas por concepto a todas las capas de los dos repos.
- Qué hizo la IA: con el mismo script (`git mv` y recálculo de imports, ahora también `.ts`/`.tsx` del front) movió 29 archivos del back (infraestructura espejando dominio, `presentacion/controlador/` y una carpeta por DTO, y todo `src/compartido/`) y 32 del front (cada pantalla con su hook y su test bajo el mismo nombre de carpeta en aplicacion y presentacion; `infraestructura/api/`; compartido por concepto). Actualizó rutas en fichas, CLAUDE.md, atlas y en la matriz de trazabilidad, que quedó idéntica en los dos repos. Verificó tsc, lint, Prettier, tests (113 back, 29 front), cobertura y build.
- Decisiones del desarrollador: agrupar también infraestructura, presentación y el front.
- Ideas descartadas: dejar el controlador suelto en presentacion/ (se usa `controlador/` para que todo esté en carpetas).
- Reglas afectadas: ninguna. Los tests solo cambian rutas de import.
- Pendientes: ninguno.

## 2026-11-09 — Crear rutina por bloques (back) e integración con las carpetas por concepto [US06]
- Desarrollador: Ignacio
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: implementar en el back la creación de rutinas por bloques y dejar la rama de US06 lista para mergear en develop sin conflictos.
- Qué hizo la IA: propuso los casos de test (15 unitarios y 5 e2e), registró las fichas y escribió los tests, el dominio (Rutina, Bloque, ObjetivoPrescripto, Pausa, TipoRutina), el caso de uso crear-rutina, la Fachada de catálogo, la persistencia TypeORM y `POST /planificacion/rutinas`. Vio el rojo, implementó, verificó con mutaciones que cada regla tiene un test que muerde y completó las fichas. Mergeó develop (T05): resolvió el conflicto de `catalogo.module.ts` y movió los archivos de US06 a carpetas por concepto con recálculo de imports. Instaló Node 24.22.1 (el proyecto pide 24.15+) y levantó Docker. Verificó tsc, lint, Prettier y la suite completa (133 tests) con la cobertura sobre los umbrales.
- Decisiones del desarrollador: aprobar los casos de test; peso opcional aunque la carga incluya Peso Extra (aclaración de RN-PLAN-05); validar el formato de los números en el DTO, no en el dominio; la rutina no tiene nombre por ahora (se decide en US07); integrar develop en la rama de US06.
- Ideas descartadas: nueva RN para el nombre de la rutina; validar los números como regla de dominio; mergear sin mover los archivos a carpetas por concepto.
- Reglas afectadas: RN-PLAN-05 (aclaración: el peso es opcional).
- Pendientes: editar-rutina (RN-PLAN-07) de US06; el editor de rutinas del front; replicar en el front la fila de US06 de la matriz de trazabilidad. Aviso: el PR #1 se mergeó en `main` (decisión 39) y después se revirtió con `7fb34c7`; `main` quedó con el contenido de `cb9cb89`.

## 2026-11-10 — Crear rutina por circuitos (back) [US09]
- Desarrollador: Ignacio
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: implementar en el back la tarjeta US09 de Jira (CG-33): el profesor crea rutinas por circuitos (RN-PLAN-01, 03 y 04; criterio adicional: 2 o más ejercicios por circuito).
- Qué hizo la IA: propuso el contrato y los casos de test (11 unitarios y 2 e2e, en archivos nuevos, sin tocar los de US06), registró la RN nueva y las fichas, vio el rojo y escribió la entidad `Circuito`, la derivación de `TipoRutina` (Bloques, Circuitos y Mixta), los circuitos en `Rutina` y en `CrearRutina`, las tablas `circuitos_rutina` y `ejercicios_circuito` con su mapper, el DTO y la respuesta del endpoint. Verificó con mutaciones que cada regla tiene un test que muerde, y verificó tsc, lint, Prettier y la suite completa (146 tests) con la cobertura sobre los umbrales.
- Decisiones del desarrollador: los circuitos llegan en una lista `circuitos` aparte de `bloques` (US06 no cambia); Mixta se deriva pero se testea en US10; un circuito no repite ejercicios (nueva RN-PLAN-20); aprobar los casos de test.
- Ideas descartadas: una lista única `elementos` con bloques y circuitos (rompía el contrato y los tests de US06); permitir ejercicios repetidos en un circuito.
- Reglas afectadas: nueva RN-PLAN-20. RN-PLAN-03 pasa a tener tests.
- Pendientes: US10 (orden entre bloques y circuitos y test de Mixta); el editor de circuitos del front (CG-36) y reflejar RN-PLAN-20 en `../front-CW-GYM/src/modulos/planificacion/CLAUDE.md`; sincronizar la matriz de trazabilidad con la del front, que tiene las columnas del front de US06.

## 2026-11-11 — Consultar rutinas paginado (back) [tarjeta a crear]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5
- Objetivo: que el profesor consulte sus rutinas en forma paginada, como base de la pantalla tipo ABM del front.
- Qué hizo la IA: buscó una tarjeta de consultar rutinas en `TARJETAS-TRELLO.md` y en Jira y no la encontró (el conector no tiene acceso al Jira de CW-GYM). Agregó `GET /planificacion/rutinas?pagina=&tamanio=` (solo Profesor, RN-PLAN-08: solo las propias), el caso de uso `ConsultarRutinas` (página desde 1, tamaño por defecto 10 y máximo 50, valores fuera de rango se acotan), `listarPorProfesor` en el puerto, en TypeORM y en el doble en memoria, y la columna de persistencia `creada_en` para ordenar de la más nueva a la más vieja. Verificó tsc, lint, Prettier, los tests unitarios de planificación y el endpoint con curl.
- Decisiones del desarrollador: consulta paginada; dejar la tarjeta como pendiente a crear.
- Ideas descartadas: devolver los nombres de los ejercicios desde el back (el front ya carga el catálogo).
- Reglas afectadas: ninguna nueva. RN-PLAN-08 todavía no tiene test en la consulta.
- Pendientes: crear la tarjeta en Trello/Jira; confirmar con el desarrollador los casos de test (unitario de ConsultarRutinas y e2e de aislamiento por profesor y paginación) y escribirlos; commitear (rama `feat/consultar-rutinas`, sin commits).
- Protección de tests (11/11/2026, pedido de Lisandro): `scripts/proteger-tests.mjs` en el hook commit-msg. Si un commit modifica, borra o renombra un test existente o su soporte, exige `Tests-aprobados-por: <git user.name>`; si toca `.husky/`, `.claude/settings.json` o el propio script, exige `Justificacion-hook:` (30 caracteres o más) y el registro queda en el historial (`git log --grep="Justificacion-hook"`). El `ask` de `.claude/settings.json` suma `Write` sobre los tests (antes solo `Edit`), los dobles y setup de test, y la protección; se niega `git commit --no-verify`. Probado en un repo descartable con 7 casos. El primer commit de este cambio necesita su propio `Justificacion-hook`.

## 2026-11-11 — Paginación, filtros, consulta y nombre de rutinas [T06, T07, T08, T09, T10]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador) · Haiku 5.5 (tests en rojo) · Sonnet 5.5 (implementación)
- Objetivo: listado de rutinas paginado con nombre editable, y listado de ejercicios paginado con GIF, buscador y filtros; registrar el trabajo en Jira.
- Qué hizo la IA: con el conector de Jira (lichimedina05) encontró CG-73 (T06) y CG-74 (T07), que ya cubrían paginación y filtros, y creó CG-75 (T08 consultar rutinas), CG-76 (T09 nombre de la rutina), CG-77 (T10 protección de tests) y las subtareas CG-78 a CG-83, todo en CG Sprint 2 (sin iniciarlo). Escribió un contrato único para back y front. Cuatro agentes Haiku escribieron los tests aprobados en rojo (47 casos entre back y front); dos agentes Sonnet implementaron contra ellos y verificaron con mutaciones. El orquestador corrigió el rótulo de T08/T09 en la documentación, unificó la matriz de trazabilidad (idéntica en los dos repos), tipó y formateó un test nuevo (`JsonBodyType`, sin tocar aserciones), formateó el fixture `ejercicios-consulta.json` (datos idénticos) y verificó la app con capturas a 375 y 1280 px. Resultado: back 141 unitarios y 40 e2e, front 83 tests; tsc, lint, Prettier y cobertura en verde.
- Decisiones del desarrollador: RN-PLAN-21 (nombre opcional, `Rutina N` por defecto, 1 a 60 caracteres, único por profesor sin distinguir mayúsculas, editable en la tarjeta del listado); tamaños de página 5, 10, 20, 50 y 100 para todos los listados con el contrato `{ items, total, pagina, tamanio }` y 400 fuera de rango; paginar y filtrar el catálogo en el back; confirmar RN-UI-LIS-01 a 04 completas; adaptar solo el mock de red de `ListaEjercicios.int.test.tsx`; aprobar los casos de test; repartir Haiku (tests) y Sonnet (implementación).
- Ideas descartadas: paginar el catálogo en el front; nombres repetidos; tamaños 20/50/100 solo para ejercicios; acotar en vez de rechazar tamaños inválidos.
- Reglas afectadas: nueva RN-PLAN-21; RN-UI-LIS-01 a 04 pasan a Vigente; RN-PLAN-08 gana tests en consultar y renombrar.
- Decisión técnica a revisar: el mapper de rutinas genera el id de cada ejercicio de circuito a partir del circuito y su posición (antes `randomUUID()`), porque al volver a guardar una rutina (renombrar) duplicaba o dejaba huérfanas esas filas.
- Pendientes: (1) dos huecos de test que sobrevivieron a la mutación: renombrar una rutina con su mismo nombre (permitido) y los filtros SQL del catálogo con datos en un e2e; (2) las rutinas que ya existían reciben el nombre por defecto de la columna (`Rutina 1`) y pueden quedar repetidas; (3) buscador sin debounce; (4) commits (necesitan `Tests-aprobados-por` y `Justificacion-hook`); (5) borrar el worktree sobrante `back-CW-GYM/.claude/worktrees/agent-ae58f0a59c967e470` y su rama.
- Agregado 11/11/2026 (cierre): (1) los dos huecos de mutación quedaron cubiertos (renombrar con su mismo nombre; e2e de filtros del catálogo con datos). (2) Rutinas viejas con nombre repetido: nuevo caso de uso `NormalizarNombresRutinas` que corre al arrancar el back (por profesor y por antigüedad, la primera conserva el nombre y las repetidas pasan al siguiente `Rutina N` libre); 5 casos (N1–N5) aprobados por Lisandro; al reiniciar el back de desarrollo renombró 3 rutinas. (3) En el front, "Músculo principal" ofrece solo los músculos del grupo elegido y vuelve a "Todos" si el músculo no pertenece (RN-CAT-05; casos D1–D4 aprobados). Back: 147 unitarios y 46 e2e; front: 87 tests; tsc y lint en verde. Siguen pendientes: buscador sin debounce, commits y el worktree sobrante.

## 2026-11-13 — Crear plan de 28 días (back y front) [US07]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: OpenCode · Big Pickle medio
- Objetivo: implementar US07 completa: como Profesor, crear un plan de 28 días con la fecha de fin calculada, una rutina o descanso por día y uno o más alumnos vinculados; back, front y tests.
- Qué hizo la IA: propuso el contrato (28 días `{ numero, rutinaId | null }`, `fechaInicio` `AAAA-MM-DD`, respuesta con `fechaFin` y los días resueltos) y los casos de test, que el desarrollador confirmó en bloque. En el back agregó el agregado `Plan` con `DiaPlan` y `ValidezPlan` (RN-PLAN-09 a 12), el caso de uso `CrearPlan` con las reglas cruzadas (RN-PLAN-13 por la fachada de identidad y RN-PLAN-14 por `RepositorioPlanes` con el `Reloj`), el puerto compartido `Reloj` con `RelojSistema` y `RelojFijo`, la persistencia (`planes`, `dias_plan`, `plan_alumnos` en una transacción) y el evento `PlanCreado`. Sumó `GET /identidad/alumnos` con `ListarAlumnosDelProfesor` para que el front tenga los alumnos vinculados. En el front creó `PaginaCrearPlan` en `/profesor/planes` (fecha de fin calculada, 28 selects con "Descanso", selección de alumnos), los helpers de fecha en `dominio/plan/plan.ts`, los hooks `usarCrearPlan` y `usarDatosParaPlan` y la opción de menú "Planes". Actualizó `CLAUDE.md`, `FICHAS-TEST.md`, `ATLAS.md`, `TRAZABILIDAD.md`, `PLAN-IMPLEMENTACION.md` y `CHANGELOG.md` en los dos repos. Resultado: back 170 unitarios y 54 e2e; front 96 tests; tsc, lint, Prettier y builds en verde.
- Decisiones del desarrollador: aprobar todos los casos de test propuestos; `fechaFin` no viaja en el DTO (el `ValidationPipe` global la descarta) y siempre sale de `ValidezPlan`; una rutina que no existe o es de otro profesor responde RN-PLAN-08 `no-encontrado`; RN-PLAN-17 se cumple por diseño (no hay operación de finalización); la pantalla se renderiza directa en `/profesor/planes` porque todavía no hay endpoint para listar planes; agregar `GET /identidad/alumnos` en vez de que Planificación importe el módulo identidad.
- Ideas descartadas: calcular la fecha de fin en el front y mandarla; resolver los alumnos desde el back de planificación (import cruzado); crear un endpoint de listado de planes en esta tarjeta.
- Reglas afectadas: RN-PLAN-08 a 15 pasan a tener tests; RN-PLAN-17 queda cumplida por diseño. Ninguna regla nueva.
- Pendientes: commitear (necesita `Tests-aprobados-por`); listar y consultar planes (US11/US12); la rutina del día (US08); el buscador sin debounce sigue abierto de T06.
