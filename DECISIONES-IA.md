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

## 2026-11-14 — Consultar la rutina del día [US08]
- Desarrolladora: Martina; confirmó los casos de prueba propuestos en esta conversación.
- Herramienta / modelo: Codex · GPT-6 · Ponytail ultra.
- Objetivo: integrar y completar US08 según RN-PLAN-11, 15 y 18 y la estructura de ATLAS.md.
- Qué hizo la IA: encontró la implementación inicial de US08 junto con US07 en `feat/rutina-28-dias` y adelantó por fast-forward la rama `feat/consultar-rutina` de ambos repositorios (back `95cf880`, front `b7b0a26`), sin crear commits. Reutilizó el agregado Plan, el reloj, las fachadas, el caso de uso, el contrato, el hook y la página existentes. Completó la visualización de fecha y pausas y el orden accesible de ejercicios, sin agregar dependencias del proyecto. Agregó pruebas de aislamiento por alumno, datos del circuito, fecha, pausas (también cero), acceso por rol y límites de vigencia en la API. Fijó el reloj del e2e por el puerto Reloj y conservó las aserciones existentes. Actualizó atlas, fichas, decisiones del módulo, trazabilidad, plan de implementación y changelog.
- Decisiones de Martina: casos con inicio 01/11/2026, días 1 y 28 incluidos, 31/10 y 29/11 sin plan vigente, descanso, objetivos completos y acceso exclusivo del alumno autenticado a su rutina.
- Verificación: 29 unitarios relacionados del backend aprobados en el homelab (12 de US08 y 17 de planes); TypeScript de ambos repositorios, ESLint de producción y de los tests nuevos, Prettier y revisión de espacios aprobados. Martina ejecutó en la laptop el e2e de la API (11/11 en 2,68 s) y las dos suites de pantalla de US08 (10/10 en 1,70 s), y compartió las salidas en esta conversación. No se ejecutó la suite completa ni Playwright. Los intentos de TDD rojo por aserción en el homelab quedaron bloqueados por el arranque de Vitest sobre SSHFS; no se atribuye un rojo de aserción a esos timeouts. El e2e del homelab agotó el beforeAll de 30 s y no ejecutó aserciones; el mismo archivo pasó sus 11 casos en la laptop sin modificar los timeouts del proyecto. Se cerraron los procesos de prueba pendientes y se detuvo y eliminó el clúster temporal del homelab.
- Entorno: las fuentes permanecen en el montaje SSHFS de la laptop. Se usó Node 24.15 en el homelab y PostgreSQL 18 temporal en memoria para los e2e, sin tocar bases existentes. Ante la latencia de SSHFS se amplió solamente el tiempo de arranque de workers de Vitest mediante un cargador en memoria; no se cambiaron configuración, dependencias ni aserciones para eludir errores.
- Ideas descartadas: reescribir US07/US08, duplicar el contrato, exponer el catálogo al Alumno, recalcular vigencia o fecha en el navegador y hacer commits/push sin pedido.
- Reglas afectadas: ninguna nueva; se implementan y verifican RN-PLAN-11, 15, 18 sobre el contrato existente de US07.

## 2026-11-14 — Métricas del sprint 2 y reestimación del trabajo pendiente
- Solicitante: Martina. Confirmó que no hay horas efectivas ni disponibilidad semanal registradas y que US06 conserva la edición en su alcance, por lo que sigue parcial.
- Herramienta / modelo: Codex · GPT-6 · Ponytail ultra.
- Qué hizo la IA: contrastó planificación, matriz, atlas, auditorías, código y Git local en los dos repos. Separó sprint calendario de fase funcional y preparación técnica de cierre formal. Registró 26 puntos técnicos de US07/US08/US09 en el sprint abierto y 52/129 acumulados. Conservó los puntos históricos; identificó T06–T10 sin estimación previa, la edición pendiente, 15 puntos listos sin integrar y el dominio Entrenamiento aún sin evidencia automatizada en la matriz.
- Nueva estimación técnica: US restantes 74 puntos (US06 residual 6, US10 8 y US13 11; otras sin cambio) más 17 de cierre, total 91. Escenarios de capacidad supuesta 37/26/20 puntos por semana desde el 15/11: 02/12, 09/12 y 16/12 con cierre. Son pronósticos condicionales del agente, no nuevas fechas comprometidas por Martina ni recortes de alcance.
- Qué actualizó: nuevo `docs/METRICAS-SPRINT-2.md`, planificación, plan operativo, trazabilidad, atlas y changelog en ambos repos. Documentos compartidos idénticos. Se conservaron las modificaciones previas de US08 y no se editaron código ni tests en esta tarea.
- Verificación: cálculos de sumas, porcentajes, reglas referenciadas, fechas por redondeo al día superior y consistencia de las copias mediante comprobaciones Python. Sin reejecutar suites de la aplicación para cambios de documentación. Los 50 casos relacionados de US08 son resultados de la sesión anterior; no se sumaron a los conteos históricos de suite ni se presentó cobertura de código nueva.
- Ideas descartadas: declarar US06 completa, sumar puntos retroactivos a T06–T10, llamar velocity formal a un sprint abierto, usar lapsos entre commits como horas reales, garantizar el 22/11 o el 01/12 con capacidad no registrada y aplicar recortes automáticamente.
- Limitaciones: sin timesheets, compromiso semanal congelado, medición de demo ni verificación nueva de cobertura completa o tablero. Google Doc original y herramientas externas sin cambios. Publicaciones, tags, merges y commits no realizados.

## 2026-11-14 — US11, bloque 1: reutilización del detalle de rutina
- Desarrolladora: Martina. Confirmó consultar solo el plan vigente y los casos de 28 días, fechas, propiedad, permisos, descansos, detalles y errores; autorizó a Codex a hacer microcommits sin push.
- Herramienta / modelo: Codex · GPT-6 · Ponytail ultra.
- Cambio de este bloque: Extrae la resolución de nombres y el DTO del detalle de rutina a `aplicacion/consultar-rutinas/resolver-rutina-para-alumno.ts`; US08 delega en esa función sin cambiar su resultado.
- Alcance: refactor de producción con las pruebas existentes de US08 intactas; todavía no agrega el endpoint ni la pantalla de US11. Los cuerpos de la transformación y del componente se conservaron literalmente durante la extracción.
- Verificación del microcommit: hooks normales de lint-staged y commit-msg; el resultado se registra al completar el bloque. No se deshabilitan hooks ni se modifica su configuración.
- Plan de los bloques siguientes: consulta de los 28 días con tests; endpoint con permisos y e2e; pantalla con detalles desplegables y tests. Test e implementación mínima de cada regla se confirman juntos; los refactors van aparte.
- Sin dependencias nuevas del proyecto, cambios de esquema, pruebas existentes editadas, commits a main ni push.

## 2026-11-14 — US11, bloque 2: consulta del plan completo
- Martina confirmó el plan vigente y los casos de 28 fechas, rutinas o descansos, detalles, propiedad y permisos. Autorizó microcommits de Codex sin push.
- `ConsultarPlanDelAlumno` usa los cinco puertos de US08; resuelve cada rutina distinta una vez, ordena días sin modificar el agregado y no expone identidades de alumnos ni profesor. El endpoint y la pantalla se conectan en bloques separados.
- Verificación TDD: rojo inicial de aserción (se esperaba plan y se recibió sin-plan); 10 casos en verde; invertir el orden de los días produjo 3 fallos y se restauró el orden ascendente. Los límites y controles de propiedad reutilizan puertos existentes.
- Refactor previo del back confirmado con hooks completos en `0c355f1`. Las verificaciones de tipos previas pasaron en ambos repos. El front tuvo errores de arranque de workers de Vitest sobre SSHFS, antes de ejecutar tests; no se consideran fallos de las reglas ni tests aprobados.
- Actualizados atlas, fichas, trazabilidad y decisiones de implementación. Sin cambios de reglas, pruebas existentes, esquema o dependencias.
- Descartado: recalcular vigencia o fechas en el navegador, exponer alumnos del plan y declarar cerrada US11 antes de verificar API y pantalla.

## 2026-11-15 — US11, bloque 3: endpoint del plan completo
- Primer rojo de API verificado por Martina en la laptop: 1 test fallido, `expected 404 to be 200`, en la consulta de los 28 días; Vitest 5.0.5, duración 1.79 s. No fue un error de importación ni de preparación.
- Cambio mínimo: fábrica de `ConsultarPlanDelAlumno` en `PlanificacionModule` y `GET /planificacion/mi-plan` en el controlador, protegido para Alumno y resuelto exclusivamente con `usuario.sub`. Sin parámetros de alumno, cambios de esquema o dependencias.
- La verificación HTTP continúa con los casos confirmados de permisos, propiedad y vigencia. Los resultados finales se registran antes de confirmar este bloque.
- Entorno: los procesos largos de herramientas del homelab se cortaban entre turnos. Sus registros y estado se guardan en `.git/codex-us11/` y se ejecutan separados de la terminal para conservar resultados; sin copias del proyecto fuera de SSHFS.
- Primer verde HTTP: el caso completo pasó en el homelab (1 test, 1528.23 s, principalmente importaciones sobre SSHFS) y en la laptop (salida de Martina, 1 test, 1.88 s, 15/11/2026). Después se agregaron los 8 casos de regresión confirmados para completar 9, con verificación en curso.
- Verificación completa de API en laptop (salida compartida por Martina, 15/11): 9/9 aprobados, duración 1.92 s. Incluye 401, 403, identidad del token frente a query ajena y los cuatro límites de vigencia. Mordida del permiso: cambiar temporalmente Alumno por Profesor produjo 8 fallos y 1 aprobado (1.84 s). Se restauró Alumno y el SHA-256 del controlador coincide con el archivo anterior a la mordida que pasó los 9 tests.

## 2026-11-15 — US11: cierre de documentación compartida
- Backend implementado y confirmado en microcommits 0c355f1, d647ce0 y b3fc859. Evidencia: 10 unitarios en homelab, 9 e2e de API en laptop y comprobación de tipos del back aprobada.
- Frontend: refactor db40646 con hooks completos en laptop; pantalla con 9 pruebas de integración y build aprobados. Se observaron los rojos previos a la implementación y se verificó que las pruebas detectan fallos introducidos temporalmente. Los cambios temporales de permisos y número de día se restauraron y sus archivos coinciden por SHA-256 con las versiones verificadas.
- Se sincronizan trazabilidad y plan operativo en ambos repos. Se marca implementación en rama, no integración ni publicación; el corte de métricas del 14/11 queda conservado. Sin push.
- Se cerró y eliminó PostgreSQL temporal del homelab. Los registros de ejecución permanecen dentro de .git/codex-us11; las fuentes se guardaron directamente en SSHFS.

## 2026-11-20 — Iniciar y retomar un entrenamiento [CG-46]

- Desarrollador: Julián.
- Herramienta / modelo: OpenCode · GPT-6.2 Sol.
- Objetivo: implementar el modelado, la API y la pantalla de US13.
- Qué hizo la IA: implementó el agregado, la copia de la prescripción, el inicio único en PostgreSQL y la consulta autenticada. Se reutilizó Planificación sin cambiar el contrato de US08.
- Decisiones del desarrollador: confirmó UTC, los estados de consulta y los casos de dominio, API y UI.
- Ideas descartadas: un proceso programado para medianoche y adelantar el registro de series o la finalización.

## 2026-11-21 — Relevamiento de patrones de diseño aplicados [T11]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 bajo (sin subagentes)
- Objetivo: listar los patrones que se vienen aplicando y sumarlos a la documentación.
- Qué hizo la IA: contrastó la tabla "SOLID y patrones" del `CLAUDE.md` del back con el código de `develop` (back `9c23451`, front `82bb99a`) y escribió `docs/PATRONES.md`, igual en los dos repos, con estado ✅ / 🔶 / ⬜ y la ubicación de cada patrón.
- Decisiones del desarrollador: pidió el listado y adjuntarlo a la documentación.
- Ideas descartadas: cambiar código para completar Observador o los puertos del front; queda como decisión del equipo.
- Reglas afectadas: ninguna.
- Pendientes: Estrategia sin código (US14/US16); Observador sin suscriptores; el front importa los clientes de API sin interfaz intermedia, distinto de lo que dice su `CLAUDE.md`. Crear la tarjeta T11 en Jira: el conector perdió el acceso a lichimedina05.

## 2026-11-21 — Sprints de Jira alineados al calendario y avance de la fase 3 [T11]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 bajo (sin subagentes), con el conector de Atlassian (lichimedina05)
- Objetivo: revisar qué entraba en el sprint 3, qué está hecho, y acomodar Jira y la doc según lo que dice Jira y las fechas de `docs/PLAN-IMPLEMENTACION.md`.
- Qué hizo la IA: comparó las 83 tarjetas de CG con `develop`. En Jira: inició y cerró CG Sprint 2 (nunca se había iniciado) con sus fechas 09–15/11; creó CG Sprint 3 (16–22/11, activo) con US10, US20, US11, US13, US12 y el arrastre de T06/T07, y CG Sprint 4 (23/11–01/12) con US14 a US18; pasó a Listo 16 subtareas de historias ya terminadas. En la doc: estado de los sprints, control de cortes (65 al 15/11 y 90 al 21/11 según Jira), fase 3 completa (36/36) y US12 en curso.
- Decisiones del desarrollador: tomar Jira como fuente del estado y usar las fechas de la doc.
- Ideas descartadas: marcar US06 como parcial en Jira o reabrirla sin consultar; mover US12 al sprint 4 aunque ya figura en curso.
- Reglas afectadas: ninguna.
- Pendientes: decidir US06 (Listo en Jira, edición RN-PLAN-07 sin código; subtareas CG-24 y CG-25 en Por hacer). CG-23 y CG-27 (Modelar de US06 y US07) no se pudieron pasar a Listo: el permiso de la herramienta lo bloqueó. Publicar `v1.2.0` y `v1.3.0`.

## 2026-11-21 — Consultar planes del profesor [CG-84, T13]
- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 bajo (orquestador) + Haiku 5.5 (2 subagentes: tests en rojo de back y front) + Sonnet 5.5 (2 subagentes: implementación de back y front, en paralelo)
- Objetivo: que el profesor vea los planes que creó; mismo estilo que el listado de rutinas, con filtros y paginación.
- Qué hizo la IA: verificó en Jira y en los repos que nadie tenía la tarea (US12, de Martina, la va a necesitar para elegir un plan). Propuso la regla RN-PLAN-22, el contrato, los filtros y los casos de test. Haiku escribió 9 unitarios y 13 e2e en el back y 8 tests de integración en el front, en rojo. Sonnet implementó `GET /planificacion/planes` (filtros y orden en la base, estado calculado con `ValidezPlan` y el `Reloj`) y `PaginaPlanes` con `usarConsultarPlanes`. El orquestador revisó, movió la creación a `/profesor/planes/nuevo` y actualizó la trazabilidad, que había quedado desfasada en el front.
- Decisiones del desarrollador: filtros por estado, alumno y rango de fecha de inicio; RN-PLAN-22 y los casos de test aprobados; listado con botón "Nuevo plan"; creación en `/profesor/planes/nuevo`. Aprobó (`Tests-aprobados-por`) el método nuevo del doble `RepositorioPlanesEnMemoria`, las fichas nuevas y el cambio de `initialEntries` en el test de US07, sin tocar aserciones.
- Ideas descartadas: volver solo al listado al crear (ocultaba el mensaje de éxito que verifica el test de US07); entrar al formulario con un clic en "Nuevo plan" desde el test; calcular el estado en la base.
- Reglas afectadas: nueva RN-PLAN-22; RN-UI-LIS-04 suma los filtros de Planes.
- Verificación: back 216 unitarios y 13 e2e de consultar planes (63 e2e de planificación según el subagente); front 28 archivos y 143 tests; tipos y lint sin errores en los dos repos.
- Pendientes: la tarjeta T12 en Jira (la creación fue bloqueada por permisos); detalle de un plan desde el listado, si se pide.

## 2026-11-22 — Registrar serie realizada [US14]
- Desarrollador: Alex
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador, dominio con TDD) + Sonnet 5.5 low (aplicación, infraestructura, presentación y e2e) + Haiku 5.5 low (documentación)
- Objetivo: registrar la serie realizada dentro del entrenamiento en curso, para que el alumno compare lo hecho con lo prescripto (RN-ENT-03, 04, 19, 20).
- Qué hizo la IA: el orquestador hizo el dominio con TDD: 18 tests unitarios nuevos, primero en rojo y luego con mutaciones para verificar que fallen cuando se rompe la regla. Sonnet 5.5 low escribió el caso de uso, el esquema `series_realizadas` con su mapper, el DTO y el controlador de `POST /entrenamiento/entrenamientos/:id/series`, y el e2e. Haiku 5.5 low actualizó la documentación del back (ATLAS, trazabilidad, CLAUDE del módulo y changelog).
- Decisiones del desarrollador: (1) cuerpo `{ orden, numero, posicion?, repeticiones?, segundos?, pesoKg? }`, con `posicion` solo en circuitos y referencia inexistente con 400 `RN-ENT-03`; (2) registrar otra vez la misma serie la reemplaza, con clave `(entrenamiento_id, orden, numero, posicion)` y upsert; (3) se exige la medida prescripta, entera y ≥ 0, y `pesoKg` opcional y ≥ 0, con 400 `RN-ENT-03`; la medida que no corresponde se ignora; (4) entrenamiento de otro alumno con 404; (5) entrenamiento abandonado con 409 `RN-ENT-20`, con el chequeo de finalizado de RN-ENT-04 pendiente para US15; (6) `POST` responde 201 con la serie, publica `SerieRealizada` después de guardar, y el inicio y la consulta en curso incluyen `series` para retomar.
- Ideas descartadas: rechazar el registro duplicado con 409; responder 403 al entrenamiento ajeno; guardar las series en el `jsonb` del entrenamiento (riesgo de perder escrituras concurrentes); rechazar repeticiones y segundos juntos (se sacó porque ninguna ficha lo cubría).
- Reglas afectadas: RN-ENT-03, 04, 19 y 20 pasan a implementarse en el back; ninguna regla cambió de texto.
- Verificación: back 242 unitarios, 3 de integración y 104 e2e (4 nuevos de US14; el de US13 sigue en verde con `series: []`); `yarn test:cov` con 349 tests y 98,19% de líneas; lint y tipos sin errores. Mutaciones sobre el caso de uso (sin control del dueño, sin guardar la serie) hacen fallar el e2e.
- Pendientes: replicar el contrato en el front (US14 front, RN-UI-ENT-01) y medir los 10 s del OKR O3 en la demo.

## 2026-11-22 — Consultar entrenamientos de mis alumnos [US18]
- Desarrollador: Alex
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (todo en serie, sin subagentes: la US es chica)
- Objetivo: que el profesor consulte los entrenamientos de sus alumnos para ajustar sus planes (RN-ENT-18).
- Qué hizo la IA: caso de uso con TDD (3 unitarios con dobles en memoria, primero en rojo), puerto `ConsultaVinculos` sobre la Fachada de identidad, listado paginado en el repositorio TypeORM con las series de cada entrenamiento, endpoint y 4 e2e. Mutaciones (sin control de vínculo, estado fijo, total, orden ascendente, sin series, salto de página) hacen fallar los tests. También integró US14 en `develop` (PR mergeado por el desarrollador) y borró su rama.
- Decisiones del desarrollador: (1) rama desde `develop` con US14 ya mergeada; (2) alumno ajeno o inexistente con 403 `RN-ENT-18`; (3) cada ítem es el entrenamiento completo más `estado`; (4) paginado con `PaginacionDto`, del más nuevo al más viejo, sin filtros; (5) los abandonados se listan.
- Ideas descartadas: 404 para el alumno ajeno; devolver solo un resumen sin la copia de la rutina; filtros por fecha (ninguna regla los pide).
- Reglas afectadas: RN-ENT-18 pasa a implementarse en el back; ninguna regla cambió de texto.
- Verificación: back 245 unitarios, 3 de integración y 108 e2e (4 nuevos de US18); `yarn test:cov` con 356 tests y 98,21% de líneas; lint y tipos sin errores.
- Pendientes: front de US18 (página de entrenamientos de alumnos); sumar el estado `finalizado` con US15.

## 2026-11-22 — Entrenamiento paso a paso con GIF y botón de finalizar [US14, T14]
- Desarrollador: Ulises
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (todo en serie, sin subagentes: el front del GIF dependía del contrato del back)
- Objetivo: después de probar a mano el front de US14, mostrar un ejercicio por vez con su GIF y el contador siempre visible, avanzar al registrar, y dejar visible el botón de finalizar hasta que exista US15.
- Qué hizo la IA: verificó que el modo secuencial era solo front, que el GIF necesitaba un cambio en el back y que finalizar dependía de US15 (back inexistente, asignada a Martina). Propuso la regla RN-UI-ENT-03, la ampliación de RN-ENT-02 y las fichas. Front: reescribió los tests de integración de US14 para el paso a paso (aprobado), implementó `PasoActual` y `FormularioSerie`, el GIF con atribución y el botón deshabilitado. Back: puerto `ConsultaEjercicios` implementado por la Fachada de catálogo (`EjercicioPublico` suma `urlGif`) y la función de dominio `conGifs` en `IniciarEntrenamiento`, con 2 unitarios y 2 e2e. Creó la tarjeta CG-85 (T14) en Jira. Sincronizó `TRAZABILIDAD.md` y `PLAN-IMPLEMENTACION.md` entre los repos.
- Decisiones del desarrollador: paso a paso con Anterior/Siguiente; arranca en el primer paso sin registrar; abandonado sigue como lista de solo lectura; GIF guardado en la copia tocando solo Entrenamiento y la Fachada de catálogo (no Planificación, cuyos e2e comparan con `toEqual`); atribución "GIF © Gym visual"; botón "Finalizar entrenamiento" deshabilitado en el último paso, sin test hasta US15.
- Ideas descartadas: agregar el GIF en la rutina del día de Planificación (cambiaba sus contratos y rompía e2e); habilitar el catálogo para el rol Alumno (toca RN-IDE-03); implementar la finalización en el back sin coordinar con US15.
- Reglas afectadas: nueva RN-UI-ENT-03 (front). RN-ENT-02 amplía la copia con el GIF (back, historial del módulo).
- Verificación: front 164 tests, back 247 unitarios, 3 de integración y 110 e2e; `yarn test:cov` en los dos dentro de los umbrales (back 98,2% de líneas); lint y tipos sin errores. Mutaciones sobre el paso inicial, el avance, Anterior/Siguiente, lo registrado, el GIF y `conGifs` hacen fallar los tests. Un test del GIF pasaba por un error del propio test (`undefined` tomaba el valor por defecto); se corrigió antes de commitear.
- Pendientes: el back de US15 para habilitar el botón; los entrenamientos anteriores a T14 no tienen GIF; nada pusheado.

## 2026-11-22 — Datos de prueba para US12 [US12]
- Desarrolladora: Martina Pineda.
- Herramienta: Codex.
- Objetivo: probar el alta y la baja de alumnos de planes vigentes desde la interfaz.
- Implementación: semilla transaccional con dos profesores y cuatro alumnos dedicados; cada profesor tiene dos alumnos vinculados y un plan con uno asignado. Usa SEMILLA_CONTRASENIA y preserva cuentas, vínculos y asignaciones existentes; informa conflictos y planes vencidos.
- Decisiones: Martina confirmó los casos y la prueba de integración con base real. Los planes usan la fecha de ejecución y contienen 28 días de descanso.
- Verificación: tres tests de integración y build aprobados en laptop. Al cambiar temporalmente a 27 días fallaron los dos tests que verifican los 28; se restauró la semilla y volvieron a pasar los tres. Martina ejecutó yarn seed en desarrollo con éxito.
- Reglas afectadas: ninguna; aplica RN-IDE-09 y RN-PLAN-09, 12, 13, 14 y 16 a datos de prueba.

## 2026-11-22 — Ejercicios en el plan de prueba [US12]
- Desarrolladora: Martina Pineda. Herramienta: Codex.
- Objetivo: consultar como alumno un plan con ejercicios en cada uno de sus 28 días.
- Implementación: comando explícito que completa el plan reservado del alumno 01 con una rutina y dos ejercicios del catálogo; conserva fechas y alumnos, y rechaza sobrescribir rutinas diferentes. Martina confirmó los casos.
- Verificación: rojo inicial observado; dos tests de integración y build aprobados en laptop; Martina ejecutó el comando correctamente en desarrollo. La comprobación por mutación detectó el cálculo y el texto alterados; los archivos fueron restaurados y sus huellas coinciden con las versiones aprobadas.
- Reglas afectadas: ninguna; aplica RN-PLAN-06, 10, 11, 12 y 13.

## 2026-11-22 — Finalizar entrenamiento y mostrar resumen [US15]
- Desarrolladora: Martina Pineda. Herramienta: Codex.
- Objetivo: finalizar y consultar peso total, grupos musculares y duración, aun sin la pantalla de registro de series de US14.
- Implementación: el back calcula con las series guardadas, el peso corporal del inicio y datos del catálogo; guarda hora y resumen. El cierre se serializa con el registro de series. El front muestra el resumen y lo recupera al recargar.
- Decisiones: Martina confirmó los casos, incluido cierre sin series y permisos. Los récords corresponden a US16 y no se simulan.
- Verificación: 6 unitarios y 2 e2e en back, 4 tests de integración en front y builds aprobados en laptop. Rojo inicial observado en back y front. La comprobación por mutación detectó el cálculo y el texto alterados; los archivos fueron restaurados y sus huellas coinciden con las versiones aprobadas.
- Reglas: RN-ENT-05, 06, 07, 08, 09, 17, 19 y 20.

## 2026-11-22 — Modelar récords personales y carga efectiva [US16]
- Desarrollador: Ramiro
- Agregado 23/11/2026 (cierre): se implementó el backend de US16 sobre US15 ya en develop. Puerto `ConsultaEjerciciosRecords` (adaptador sobre la Fachada de catálogo, devuelve `nombre`, `tipo`, `tipoCarga` y `factorPesoCorporal`), repositorio `RepositorioRecords` con TypeORM (`records_personales`, único por `alumno_id, ejercicio_id, tipo`, upsert conservando el `id`), y `CerrarEntrenamientoConRecords` (A2) que envuelve a `CerrarEntrenamiento` sin tocar sus tests: cierra, re-lee el entrenamiento, calcula marcas con `MarcasPorTipoEjercicio`, agrupa por `(ejercicioId, tipo)` quedándose con la mejor marca, detecta contra los previos con `DetectorRecords`, guarda y publica cada `RecordBatido`, y devuelve `recordsBatidos` solo si hay batidos. `recordsBatidos` es opcional en la respuesta para no romper los tests de US15 (que usan `toEqual`). Endpoint sin cambios: el controlador usa el envoltorio en el mismo `POST /entrenamiento/entrenamientos/:id/finalizacion`. Verificación: 274 unitarios, 12 de integración, 115 e2e, lint y build en verde. Limitación aceptada: si falla la persistencia de récords, el entrenamiento ya quedó finalizado y `EntrenamientoFinalizado` ya se publicó. Diferido: FK `entrenamiento_id` con `ON DELETE CASCADE` y filas de `FICHAS-TEST.md`.

## 2026-11-23 — Finalizar en el último paso y e2e de navegador del MVP [US15, T15]
- Desarrollador: Ulises
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador) + Sonnet 5.5 medium (1 subagente: P1, E1–E3 y S1, en serie porque comparten la base de test y los puertos)
- Objetivo: comprobar que la finalización de US15 (Martina) convive con el paso a paso de US14 y cubrir con e2e de Playwright los cuatro flujos del cierre del MVP (fase 5, CG-86).
- Qué hizo la IA: revisó la rama de US15 (salía de un `develop` anterior a US14, con 8 conflictos) y, ya integrada por Martina, encontró dos botones «Finalizar entrenamiento» en el último paso. Dejó solo el del último paso, habilitado, y adaptó la rutina falsa de los 2 tests de integración que finalizan (esperados sin cambios). Creó la tarjeta CG-86 (T15). Registró las fichas, escribió el soporte (`e2e/soporte/api.ts` prepara datos por la API real, `sesion.ts` ingresa y navega) y los e2e de ingreso y vínculo; delegó plan del día, entrenamiento completo y seguimiento al subagente y revisó su reporte. Adaptó `importar-rutina.e2e.ts`, que fallaba desde T13 porque «Planes» pasó a ser el listado. Configuró Playwright con un solo worker y `E2E_PUERTO_FRONT` para correr contra el back de test (3001) sin tocar los servidores de desarrollo, y lo documentó en `docs/TESTING.md`. Sincronizó `TRAZABILIDAD.md` (US15 ya integrada) y `PLAN-IMPLEMENTACION.md` entre los repos.
- Decisiones del desarrollador: «Finalizar entrenamiento» solo en el último paso (lo pedido en US14) en lugar de visible desde el paso 1; aprobó cambiar la entrada de los 2 tests de US15 y adaptar el e2e de importar rutina; tarjeta T15; reparto Opus (soporte, fichas e I1–I4) + Sonnet medium (resto); descargar Chromium para Playwright.
- Ideas descartadas: dejar el botón de Martina siempre visible (contradecía la decisión de US14); integrar US15 antes de que Martina lo hiciera (era su tarea); correr los e2e contra la base de desarrollo (cada alumno se vincula y entrena una sola vez, así que necesitan la base de test recién sembrada); varios workers o subagentes en paralelo (generar un código invalida el anterior y comparten la base); testear el abandono (RN-ENT-20) en e2e (no se puede mover el reloj del back real).
- Reglas afectadas: ninguna nueva. Se cubren en navegador RN-IDE-01, 08, 09, 10, 11; RN-PLAN-08, 11, 13, 15, 21; RN-ENT-01, 02, 03, 05, 06, 17, 18; RN-UI-ENT-02, 03, 04.
- Verificación: front 177 tests de Vitest y 12 e2e de navegador en verde con la base recién sembrada; lint sin errores. Cada e2e nuevo y la adaptación de importar rutina fallaron por aserción al romper una línea de producción (11 mutaciones, restauradas).
- Pendientes: no hay test de que «Finalizar» no aparezca antes del último paso; P1 calcula la fecha de fin en el test porque depende del día; la parte del alumno en P1 no tiene mutación propia; ramas pusheadas sin PR (`fix/US15-finalizar-ultimo-paso`, `test/T15-e2e-navegador` en el front y `docs/T15-e2e-navegador` en el back).

## 2026-11-23 — Jira y documentación alineados con develop [T11]
- Desarrollador: Lisandro. Herramienta / modelo: Claude Code · Opus 5.5.
- Objetivo: que Jira (CG) y la documentación reflejen lo que realmente está integrado en `develop`.
- Qué hizo la IA: comparó Jira, `TRAZABILIDAD.md`, `PLAN-IMPLEMENTACION.md` y el historial de los dos repos. En Jira pasó a Listo CG-54 y CG-55 (subtareas de US15), CG-73 (T06), CG-74 (T07) y CG-86 (T15); pasó US06 (CG-22) y sus subtareas CG-24 y CG-25 a En curso porque la edición de rutinas (RN-PLAN-07) no tiene código; etiquetó como `descartada` las subtareas de US01 (CG-7, 8, 9). En la documentación marcó US10, US11, US12, US14, US15 y US18 como integradas y recalculó el acumulado: 103/129.
- Decisiones del desarrollador: «actualizá todo al estado verdadero del repo».
- Pendientes: borrar a mano CG-6 a CG-9 (el conector no borra); US06 (edición), US16 y US17.

## 2026-11-24 — Notificar al profesor un entrenamiento por debajo de lo prescripto [US21]
- Desarrollador: Ulises
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador) + Sonnet 5.5 medium (7 subagentes) + Haiku 5.5 low (2 subagentes).
  - Back, en tres tandas: A (RN-ENT-21), B (publicador) y C (dominio, Haiku) en paralelo; después D (casos de uso); después E (infraestructura, API y e2e).
  - Front: F (bandeja); después G (contador) y H (`?alumno=` de US18, Haiku) en paralelo; después I (e2e de Playwright).
- Objetivo: que el profesor reciba, dentro de la app, una notificación cuando un alumno suyo finaliza un entrenamiento con resultados por debajo de lo prescripto. La tarea no tenía tarjeta en Jira.
- Qué hizo la IA:
  - **Jira:** creó CG-87 (US21, 11 pts, Sprint 4) con sus subtareas CG-88 (Modelar), CG-89 (Backend) y CG-90 (Frontend).
  - **Modelado:** preguntó las zonas grises y escribió el modelo en los dos repos:
    - módulo nuevo `notificaciones` con RN-NOT-01 a 05, RN-ENT-21 y la decisión 45;
    - glosario (Serie por debajo de lo prescripto, Notificación, Gravedad), plan, trazabilidad y atlas.
  - **Fichas:** propuso las fichas (25 del back, 8 del front) y las registró una vez confirmadas.
  - **Back:**
    - función pura `seriesPorDebajo`;
    - `EntrenamientoFinalizado` con las series por debajo, publicado por la entidad (`eventoDeFin`);
    - `PublicadorEventosEnProceso` con el puerto `SuscriptorEventos`, primer suscriptor real (Observador ✅ en `PATRONES.md`);
    - agregado `Notificacion` y objeto de valor `Gravedad`;
    - cuatro casos de uso, repositorio TypeORM, adaptador de la Fachada de identidad (`obtenerProfesorPorUsuarioId`), suscriptor, controlador y e2e con el publicador real.
  - **Front:**
    - bandeja `/profesor/notificaciones`;
    - contador "Notificaciones (N)" en el menú, compuesto desde `Aplicacion.tsx` y solo para el Profesor;
    - enlace a US18 con `?alumno=`;
    - e2e de Playwright.
  - **Revisión:** revisó cada reporte y el código de cada subagente, corrió la verificación completa y actualizó fichas, atlas, trazabilidad, `CHANGELOG` y reglas.
- Decisiones del desarrollador:
  - **Qué cuenta como por debajo:** una serie queda por debajo con menos repeticiones, segundos o peso (si había peso prescripto) que lo prescripto. Las no registradas cuentan como cero y, en un circuito, cuenta cada ejercicio de cada vuelta.
  - **Gravedad:** Leve con menos del 40% de las series por debajo; Grave con el 40% o más. Manda el porcentaje: 1 de 2 es Grave.
  - **Bandeja y módulo:** bandeja con contador de no leídas y "Marcar como leída", en un módulo nuevo que escucha el evento.
  - **Preparado para US17:** RPE y sensación de fuerza van en la misma notificación. Por ahora es `percepcion: null` en la tabla y en el contrato, con RN-NOT-05 a confirmar.
  - **Patrones:** énfasis en respetar las convenciones y los patrones de los `.md` antes de codear.
  - **Confirmaciones:** confirmó las fichas, más 3 nuevas del dominio del front para recuperar el umbral de cobertura de ramas (78,84% → 80,46%); los repartos por tanda y los microcommits.
- Ideas descartadas:
  - `@nestjs/event-emitter`: se resolvió con un publicador propio, sin paquetes nuevos.
  - Volumen total o un umbral de cumplimiento como criterio de "por debajo".
  - Contar solo las series registradas.
  - Notificación como agregado dentro de Entrenamiento.
  - Marca en la página de US18 en lugar de una bandeja.
  - Desactivar el contador en los tests o agregar una respuesta por defecto en la red falsa compartida. No hizo falta: el contador ignora los errores de red.
  - Reunificar el recorrido de `registrarSerie` con `seriesPrescriptas`: queda como refactor aparte.
- Reglas afectadas:
  - Nuevas: RN-ENT-21, RN-NOT-01 a 04 (vigentes), RN-NOT-05 (a confirmar con US17), RN-UI-NOT-01 y 02.
  - Ajuste el mismo día: RN-UI-NOT-01 también se actualiza al marcar, como pide la ficha e2e confirmada.
- Verificación:
  - Back: `yarn test:cov` 399/399, con cobertura y lint OK.
  - Front: 188/188 en Vitest con cobertura y 13/13 e2e de navegador, con la base recién sembrada.
  - En cada ficha el test detectó un cambio hecho a propósito en el código, que después se restauró.
  - Lo que no detecta ningún test quedó anotado en las fichas: dos cambios en E7 y el `ON CONFLICT DO NOTHING`.
  - El e2e de Playwright encontró que el contador tardaba 60 s en actualizarse; se corrigió con un aviso interno del módulo.
- Pendientes:
  - Ramas `feat/US21-notificar-entrenamiento-por-debajo` sin pushear ni PR.
  - Cuando se trabaje US17: si cargar la percepción vuelve la notificación a no leída y si una percepción baja notifica aunque no haya series por debajo.
  - Mover CG-87 a CG-90 en Jira.
  - El back de test (`yarn start`) deja vivo el proceso `dist/main` al detener la tarea: se cerró a mano dos veces.

## 2026-11-24 — Percepción del alumno y su notificación al profesor [US17]
- Desarrollador: Ulises
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador) + Sonnet 5.5 medium (5 subagentes) + Haiku 5.5 low (1 subagente).
  - Back: A (entrenamiento) y B (notificaciones, dominio y aplicación) en paralelo; después C (suscriptor, repositorio y e2e).
  - Front: D (resumen y US18) y E (notificación, Haiku) en paralelo; después F (e2e de Playwright).
- Objetivo: que el alumno cargue su RPE y su sensación de fuerza (US17, CG-60) y que el profesor lo vea, integrado con la notificación de US21.
- Qué hizo la IA:
  - Preguntó las zonas grises y escribió el modelo en los dos repos: RN-ENT-16 cambia, RN-NOT-01 y 05 cambian, se suman RN-NOT-06 y 07, decisión 46, glosario, plan, trazabilidad y atlas.
  - Propuso 20 fichas (13 del back y 7 del front) y las registró cuando las confirmó Ulises.
  - **Back:**
    - objetos de valor `Rpe` y `SensacionFuerza` y método `Entrenamiento.registrarPercepcion`, que emite `PercepcionRegistrada`;
    - `POST /entrenamiento/entrenamientos/:id/percepcion` con escritura condicional (`fin IS NOT NULL AND percepcion IS NULL`) y la percepción en las dos lecturas;
    - en notificaciones: `Percepcion.esMala`, `Gravedad.dePercepcion` y `Gravedad.mayor`, `crearPorPercepcion`, `sumarPercepcion` (vuelve a no leída), el caso de uso `SumarPercepcion` y su suscriptor.
  - **Front:**
    - formulario de percepción en el resumen, con validación antes de enviar;
    - la percepción en US18 y en la notificación;
    - "Percepción mala" sin lista de series.
  - Revisó cada reporte y completó las mutaciones que faltaban (el rechazo de `crearPorPercepcion` y el camino sin profesor). Alineó el tipo `Percepcion` del front al contrato (siempre numérico), actualizó la documentación y cerró el back de test sin dejar procesos vivos.
- Decisiones del desarrollador:
  - **Cuándo y cómo se carga:** solo en un entrenamiento finalizado, una sola vez y los dos valores juntos.
  - **Notificación existente:** si el entrenamiento ya tiene notificación, la percepción se suma y la notificación vuelve a no leída.
  - **Percepción mala:** RPE ≥ 9 o sensación ≤ 2. Notifica aunque no haya series por debajo, Leve con una condición y Grave con las dos.
  - **Gravedad combinada:** con series por debajo, queda la gravedad mayor.
  - **Confirmaciones:** modelo, fichas, repartos y microcommits.
- Ideas descartadas:
  - cargar la percepción en curso;
  - carga parcial o corregible;
  - sumar la percepción sin cambiar la lectura;
  - umbrales "RPE ≥ 9 y sensación ≤ 2" o solo los extremos;
  - percepción siempre Leve o siempre Grave;
  - que la percepción no cambie la gravedad;
  - `PUT` para la carga (se usó `POST`, porque se carga una sola vez).
- Reglas afectadas: RN-ENT-16 (cambia), RN-NOT-01 y 05 (cambian; la 05 pasa de "a confirmar" a vigente), RN-NOT-06 y 07 (nuevas). En el front: RN-ENT-16 (UI), RN-UI-ENT-04, RN-NOT-05 y 06 (UI).
- Verificación:
  - Back: `yarn test:cov` 422/422, con lint y build OK.
  - Front: `yarn test:cov` 195/195 (ramas 81,28%) y 14/14 e2e de navegador con la base recién sembrada.
  - En cada ficha se rompió a propósito una línea de producción, el test dio rojo y se restauró.
  - Quedaron anotados en las fichas:
    - el rojo previo de N1 a N5 fue un `TypeError`, no una aserción, y N6 no tuvo rojo previo;
    - ningún test detecta quitar `AND percepcion IS NULL` del UPDATE condicional, porque no hay test de carga simultánea;
    - no hay caso para la sensación de fuerza 6;
    - la entrada de P6 se aclaró: en curso propio da 409 y ajeno da 404.
- Pendientes:
  - ramas `feat/US17-percepcion` sin pushear ni PR;
  - mover CG-60 a CG-62 en Jira;
  - decidir si `GET` de US18 incluye `percepcion` solo en finalizados, como `mi-entrenamiento-en-curso`;
  - fichas para la carga simultánea y para la sensación de fuerza 6, si se quieren.

## 2026-11-24 — Consultar y editar una rutina [US06]
- Desarrolladora: Martina
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5, sin subagentes (el front depende del contrato del back; delegar no ahorraba trabajo).
- Objetivo: completar el CRUD de US06. Ya se creaba una rutina y se cambiaba su nombre, pero no su contenido. Rama `fix/US06-consultar-editar-rutina` en los dos repos.
- Qué hizo la IA:
  - Revisó el código y avisó que el listado (T06) ya existía; con la aclaración de Martina, propuso el detalle de una rutina en el editor precargado y su edición.
  - Propuso 11 casos de test (8 del back y 3 del front) y los escribió en rojo después de que Martina los confirmó.
  - **Back:** extrajo `resolverContenido` de `CrearRutina` (refactor aparte); `Rutina.editar`, caso de uso `EditarRutina`, `ConsultarRutinas.porId`, `GET` y `PUT /planificacion/rutinas/:id`. Corrigió `RepositorioRutinasTypeorm.guardar`, que dejaba en la base los bloques y circuitos quitados.
  - **Front:** cliente `obtenerRutina` y `editarRutina`, hook `usarEditarRutina`, `rutinaAEdicion`, `PaginaEditarRutina` en `/profesor/rutinas/:id` y "Ver y editar" en cada tarjeta. `EditorRutina` acepta `rutina` y `edicion`, suma el campo "Nombre" y "Guardar cambios".
- Decisiones de la desarrolladora:
  - **Qué falta:** editar los ejercicios, repeticiones, pausas y demás desde un detalle de la rutina, no solo el nombre.
  - **Confirmaciones:** casos de test y microcommits.
- Ideas descartadas:
  - una pantalla de detalle de solo lectura aparte del editor;
  - editar solo valores, sin poder agregar, quitar o reordenar bloques y circuitos;
  - un e2e que inicie un entrenamiento antes de editar: los entrenamientos guardan su propia copia y ninguna tabla de entrenamiento apunta a las de rutinas.
- Reglas afectadas: ninguna cambia. Se implementa RN-PLAN-07, que figuraba sin código, con RN-PLAN-01, 06, 08 y 21.
- Verificación:
  - Back: `yarn test` 307/307, `yarn test:e2e` 120/120, `yarn test:int` 8/8 y lint OK.
  - Front: `yarn test` 198/198, lint y `tsc -b` OK.
  - Cada test nuevo dio rojo por la razón correcta antes de implementar: la función sin implementar, el método inexistente, la ruta 404 o el enlace inexistente.
  - En el test del front se espera el campo "Repeticiones" con `findByLabelText`, porque aparece cuando llega el catálogo (sin cambiar las aserciones).
- Segunda parte (misma sesión), pedido de Martina: el lápiz de la tarjeta, que solo editaba el nombre, abre la rutina en el editor.
  - La IA avisó que cambiaba tests existentes y propuso reemplazarlos. Martina lo aprobó.
  - Se quitaron el botón "Ver y editar", la edición del nombre en la tarjeta (`usarRenombrarRutina`, `renombrarRutina` y `reemplazar`) y su CSS. El back conserva el `PATCH` del nombre.
  - Tests: se borraron los 3 de renombrar en la tarjeta. Se sumó uno que cambia el nombre en el editor. `PaginaEditarRutina.int.test.tsx` abre la rutina con el lápiz "Editar rutina", sin cambiar sus aserciones.
  - Verificación: front `yarn test` 196/196, lint y `tsc -b` OK.
- Pendientes:
  - ramas sin pushear ni PR;
  - mover US06 en Jira;
  - no se corrieron los e2e de Playwright del front.

## 2026-11-24 — Integración de US16 (récords) y limpieza de ramas [US16]

- Modelo: Opus 5.5 solo, sin subagentes. Pedido de Lisandro.
- Qué hizo la IA:
  - Relevó las ramas remotas adelantadas a `develop`: `feat/US16-record-personal` (back, Ramiro), `feat/US16-frontend-records` (front, Ramiro) y `feat/US18-consultar-entrenamientos-de-alumnos` (back, alex, un commit de docs del 22/11).
  - Revisó US16 y la mergeó con `--no-ff` en ambos repos, sin conflictos.
  - Detectó que el PR #17 del front y el PR #1 del back se habían mergeado a `main` por error y ya estaban revertidos (#18 y "vuelvo a la version cb9cb89"); `develop` no se vio afectado.
- Decisiones del desarrollador (Lisandro):
  - La rama de US18 de alex se borra: sus docs chocaban con versiones posteriores de `develop`.
  - Se aprueba corregir el test de récords del front: armaba una rutina sin bloques y, desde US15, «Finalizar» aparece solo en el último paso. Se agregó un bloque de una serie, sin cambiar las aserciones.
- Observación del review (sin cambio): `CerrarEntrenamientoConRecords` calcula los récords después de cerrar, fuera de la misma transacción; si falla, el entrenamiento queda cerrado y el usuario ve un error.
- Verificación: back `yarn test:cov` 463/463, `yarn test:int` 12/12 y lint OK; front `yarn test:cov` 203/203 y lint OK.
- Pendientes: mover US16 en Jira (ya figuraba en Listo antes de integrarse); e2e de Playwright no corridos.

## 2026-11-24 — Editar días del plan, alerta de incumplimiento y volver al inicio [US22, US23, T16]

- Desarrollador: Lisandro
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 orquesta; Haiku 5.5 low (tests en rojo del back de US22 y T16 completa) y Sonnet 5.5 (back y front de US22, US23 completa). US23 y T16 en worktrees aparte (`IyCS-wt/`) para trabajar en paralelo con US22.
- Objetivo: tres pedidos del desarrollador al probar el sistema: editar los días de un plan vigente (US22, CG-91, 8 pts), alertar al profesor cuando un alumno junta 3 entrenamientos seguidos por debajo de lo prescripto (US23, CG-92, 5 pts) y un enlace para salir del resumen del entrenamiento (T16, CG-93, 1 pt). Las tres quedan fuera de la base V1 de 129 pts.
- Qué hizo la IA:
  - Propuso RN-PLAN-23, RN-NOT-08 y RN-UI-ENT-05 con sus fichas; el desarrollador las confirmó antes de escribir tests. Creó las tarjetas en Jira (Sprint 4).
  - **US22:** `Plan.editarDia`, caso de uso `EditarDiaPlan`, `ConsultarPlanes.porId`, `GET /planificacion/planes/:id` y `PUT /planificacion/planes/:id/dias/:numero`. El chequeo de "entrenamiento iniciado hoy" usa un puerto propio con SQL sobre `entrenamientos`, para no crear un ciclo Planificación → Entrenamiento. Front: "Editar días" en la tarjeta del plan y grilla de 28 días con los pasados bloqueados.
  - **US23:** función de dominio `detectarRachasDeIncumplimiento`, tabla propia `finalizaciones_alumno` (Notificaciones no lee Entrenamiento), tipo de notificación (`entrenamiento` | `alerta-incumplimiento`) con índice único (`entrenamiento_id`, `tipo`). Front: tarjeta de alerta en la bandeja.
  - **T16:** enlace "Volver al inicio" debajo del resumen.
- Decisiones del desarrollador:
  - La alerta de US23 se suma a la notificación por entrenamiento; cuenta cualquier gravedad; abandonado no cuenta ni corta; la percepción mala sola no cuenta; la racha vuelve a cero al alertar.
  - Casos extra confirmados: el mismo evento dos veces no duplica la alerta; no hay alertas retroactivas.
  - Durante el desarrollo se corren solo los tests relacionados con lo trabajado y sin mutaciones; la suite completa, cuando él la pida.
  - develop se integra en main (decisión 39, con su permiso).
- Ideas descartadas: que Planificación importe el módulo de Entrenamiento (ciclo); reemplazar la notificación por entrenamiento por la alerta.
- Reglas afectadas: nuevas RN-PLAN-23, RN-NOT-08 y RN-UI-ENT-05.
- Verificación (tests relacionados, después de integrar): back planificación, entrenamiento y notificaciones 253/253 unitarios y 12/12 e2e (notificaciones y editar-dia-plan); front planificación, entrenamiento y notificaciones 165/165, tsc y lint OK. Mutaciones hechas antes del cambio de criterio: US22 front (bloqueo de días pasados) y US23 (corte de racha y reinicio), todas detectadas.
- Pendientes:
  - `finalizaciones_alumno` arranca vacía: los entrenamientos previos a US23 no cuentan para la racha.
  - Mutaciones del back de US22 no hechas (fecha pasada, entrenamiento iniciado, propietario).
  - Suite completa sin correr después de integrar; un e2e de ingreso falló una vez en corrida completa por la base de test compartida entre agentes y pasa solo.

## 2026-11-25 — Mi plan en calendario y estado del día en el inicio del Alumno [T25]
- Desarrollador: Ulises
- Herramienta / modelo / esfuerzo: Claude Code · Opus 5.5 (orquestador y diseño, skill Impeccable) + Sonnet 5.5 medium (1 subagente revisor).
- Objetivo: T25 (CG-103). Mostrar Mi plan como calendario en lugar de una lista de días y sumar al inicio del Alumno el estado de su entrenamiento de hoy con un acceso directo. Sin cambios en la API. Toca los dos repos: el front y la copia de `docs/TRAZABILIDAD.md` del back.
- Qué hizo la IA:
  - **Tarjeta de Jira:** redactó la descripción de CG-103 con el formato de las demás (alcance y criterios de aceptación), después de preguntar las cuatro decisiones de diseño, y la cargó.
  - **Relevamiento:** el back ya informa la fecha de hoy en `GET /planificacion/mi-plan`, así que el día marcado no usa el reloj del navegador. El texto de RN-PLAN-19 en el back nunca mencionó el desplegable, por lo que no cambió; solo cambió la tabla de UI del front.
  - **Reglas y tests:** propuso el texto de RN-PLAN-19 (UI) y de la nueva RN-UI-ENT-06, la adaptación del test del detalle y las fichas nuevas, y esperó la aprobación. Los tests arrancaron en rojo por aserción y se comprobó que muerden rompiendo la producción.
  - **Calendario de Mi plan:** lunes a domingo con el día 1 en su columna, hoy en ámbar y elegido al entrar, el día elegido con su detalle en un panel debajo.
  - **Tarjeta "Hoy":** planificación resuelve el día (rutina, descanso o sin plan) y entrenamiento el estado (pendiente, en curso o hecho); la raíz de composición (`Aplicacion.tsx`) los junta, sin que un módulo importe el interior del otro. La columna del acceso es `AccesoDelDia`, en `compartido`.
  - **Revisión de terminación:** aplicó lo que no tocaba tests:
    - desplazar hasta el panel al tocar un día y anunciarlo;
    - casillas de 45 px a 360 px;
    - contorno en el punto de color;
    - foco pegado a la casilla.
  - **Nombre accesible de los días:** con la aprobación del desarrollador, cada día pasó a nombrarse por lo que muestra más el día del plan y la fecha (WCAG 2.5.3). Se unió con `aria-labelledby` porque el cálculo del nombre recortaba los espacios.
  - **Revisión manual del desarrollador (dos rondas):**
    - Mi plan: el nombre de la rutina sale de las casillas, queda un punto de color por rutina con una leyenda al costado (sin leyenda en el celular), los días del mes siguiente van en segundo plano, y en escritorio el punto y el título van centrados.
    - Inicio: la tarjeta "Hoy" pasa a dos columnas, con la fecha en el mismo rótulo que "Hoy" a la derecha, "Ir al entrenamiento" arriba de la columna en la cancha y las tarjetas de acceso del mismo alto.
  - **Errores encontrados:**
    - Editó tests por shell una vez; el permiso lo frenó y los rehízo con Edit.
    - Bash rompió las comillas invertidas al escribir un componente y las fichas de entrenamiento; los rehízo con Write.
    - Un reemplazo de CSS empezó en la primera aparición del selector y se llevó dos reglas de relleno; lo vio en la captura y las repuso.
    - El test de la leyenda no mordía porque los datos no repetían rutinas; se le agregó una repetición, como pide su ficha.
  - **Commits:** tres en el front (calendario, tarjeta "Hoy" y documentación) y uno en el back (trazabilidad). Los dos `feat` superan las ~150 líneas porque el CSS, el componente y los tests de cada pieza no se separan sin romper la compilación o los tests.
- Decisiones del desarrollador:
  - Detalle del día en un panel debajo del calendario, calendario de lunes a domingo, la tarjeta "Hoy" siempre con el estado del día y acceso según el estado.
  - Nombre accesible de cada día por lo que se ve.
  - Un color por rutina con leyenda al costado, sin leyenda en el celular, y el mes siguiente en segundo plano.
  - Columna del acceso en el verde de cancha: amplía la regla de DESIGN.md (la cancha ya no es solo marco y tanteador).
  - Texto "Tenés un entrenamiento en curso"; aprobó los cambios en los tests de RN-PLAN-19 y RN-UI-ENT-06.
- Ideas descartadas:
  - Detalle flotante dentro de cada día (conservaba los tests, pero se superponía).
  - Semanas del plan sin días de la semana.
  - Sección "Hoy" solo con entrenamiento pendiente, o acceso que inicia directamente.
  - Todas las rutinas en lila, o leyenda debajo del calendario en el celular.
  - Columna del acceso en el verde de acción.
  - Nombre de la rutina dentro de la casilla, primero en una línea y después en dos (lo sacó la revisión manual).
  - "Ir al entrenamiento" dentro del enlace (habría roto WCAG 2.5.3 y los tests).
- Reglas afectadas:
  - RN-PLAN-19 (UI del front): calendario, hoy marcado, leyenda y detalle del día elegido.
  - Nueva RN-UI-ENT-06: estado del día en el inicio del Alumno.
  - Las dos con su historial en los `CLAUDE.md` de planificación y entrenamiento.
- Verificación:
  - Lint y `tsc` OK.
  - Vitest 220/220.
  - e2e de navegador 14/14.
  - Detector de la skill sin hallazgos.
  - Sin desborde horizontal de 320 a 1280 px.
  - Medidas en el navegador: casillas de 45×54 px a 360 px, el punto centrado en escritorio, "Hoy" e "Ir al entrenamiento" a la misma altura y el panel a la vista al tocar un día.
- Pendientes:
  - Ramas `feat/T25-calendario-inicio-alumno` (front) y `docs/T25-trazabilidad` (back) sin pushear ni PR.
  - Sin revisión de terminación después de la revisión manual.
  - Mover CG-103 en Jira.
  - Tres tests existentes que abren `/alumno` ahora piden la rutina del día sin respuesta declarada (MSW solo lo advierte).

## 2026-11-25 — Documentación Swagger de toda la API [T26]

- Qué hizo la IA:
  - Actualizó `develop` con `main` (fast-forward, 5 commits) y lo pusheó. Creó la rama `docs/swagger` desde `develop`.
  - Instaló `@nestjs/swagger@12.1.2` exacta (12 días de antigüedad; 39 versiones verificadas, todas con más de 24 h).
  - Tomó como referencia el back de CW Tech (proyecto anterior): `DocumentBuilder` con bearer JWT, `@ApiTags`, `@ApiOkResponse({ type })` y `@ApiProperty` con `description` y `example`.
  - Armó la base: `configurarSwagger` (UI en `/api`, documento en `/api-json`, esquema `jwt`, versión de `package.json`), `ErrorRespuesta` y `PaginacionDto` documentado.
  - Delegó en 15 agentes Haiku 5.5 en paralelo, sin archivos compartidos: por módulo, uno para las clases de respuesta, uno para los DTO de entrada y uno para el controlador. Notificaciones llevó 2 (no tiene DTO de entrada) y planificación 4 (respuestas de rutinas y de planes por separado). Los nombres de las clases se fijaron de antemano para que el controlador las importara sin esperar.
  - Resultado: 32 endpoints en 5 tags, todos con resumen, respuesta tipada y errores `{ codigo, mensaje }`; 68 esquemas, todas las propiedades con descripción.
- Decisiones del desarrollador:
  - Swagger en `/api`, como en CW Tech.
  - Rama `docs/swagger` en lugar de `doc&swagger` (convención de subramas).
  - Las entidades se documentan con clases de respuesta en `presentacion/respuestas/`; las interfaces de respuesta de los controladores (`RutinaRespuesta`, `PlanRespuesta`, `EjercicioRespuesta`, etc.) pasaron a clases con el mismo nombre y la misma forma.
  - Repartir en 15 Haiku (3 por módulo) en lugar de 5, con respuestas de no más de 200 caracteres.
  - Commits con `[T26]` (el validador no acepta `[DOCS]`). `develop` pusheado; la rama nueva queda local.
- Ideas descartadas:
  - `@ApiProperty` en las entidades de dominio, como en CW Tech: rompe la regla 1 (el dominio no importa Nest) y documentaría la forma interna, no lo que recibe el front.
  - Decorar los esquemas TypeORM: no salen por la API.
  - El plugin de la CLI de Nest que infiere los tipos: con decoradores explícitos el documento no depende del build.
  - Publicar Swagger desde `configurarAplicacion`: los e2e no lo necesitan.
- Reglas afectadas: ninguna. Las descripciones citan las RN vigentes de cada `CLAUDE.md` de módulo.
- Verificación:
  - `tsc`, lint y prettier OK. `vitest related` no encontró tests afectados.
  - Levantó el back y auditó `/api-json`: completó a mano `RenombrarRutinaDto` (un agente lo omitió) y comparó los esquemas con los tipos de los casos de uso.
- Pendientes:
  - Correr los e2e (se denegó la suite completa sin pedido del desarrollador).
  - Push y merge de `docs/swagger`.
- Segunda ronda (revisión del desarrollador en `/api`):
  - Pedido: dividir Planificación por recurso y que se vean los DTO y las entidades (en "Schemas" no se distinguían).
  - Decisiones del desarrollador: tags por recurso en todos los módulos (`Identidad · Ingreso / Profesores / Alumnos`, `Planificación · Rutinas / Planes / Mi plan (Alumno)`, `Entrenamiento · Alumno / Profesor`), y schemas agrupados por prefijo y ordenados: `Entidad.*`, `Dto.*`, `Respuesta.*`.
  - Implementación: `@ApiSchema({ name })` en cada clase; `configurarSwagger` define el orden y la descripción de los tags (`TAGS`), ordena los schemas por grupo y desactiva `autoTagControllers`. Las respuestas que son la forma pública de una entidad pasaron a `Entidad.*` (Ejercicio, Rutina, Bloque, Circuito, EjercicioPrescripto, Plan, DiaPlan, Entrenamiento, SerieRealizada, Notificacion). Las entidades que no salen por ningún endpoint (Usuario, Profesor, Alumno, RecordPersonal) tienen clases solo de documentación en `presentacion/entidades/`, registradas con `@ApiExtraModels`; Usuario no expone la contraseña. Los DTO de query (`ConsultarPlanes`, `ConsultarEjercicios`, `Paginacion`) también se registran para que figuren en Schemas.
  - Delegación: 9 agentes Haiku 5.5. Dos dejaron `Dtoextends` sin espacio; lo detectaron prettier y `tsc` y se corrigió a mano.
  - Resultado: 14 entidades, 17 DTO y 47 respuestas, sin schemas fuera de grupo ni propiedades sin descripción; 10 tags.
- Tercera ronda (revisión del desarrollador):
  - Pedido: los modelos se veían como `[...]` y las entidades y los DTO quedaban mezclados dentro de "Schemas", en lugar de verse como secciones, al estilo de los endpoints.
  - `[...]` era la profundidad de expansión por defecto de Swagger UI: se subió `defaultModelExpandDepth` a 3.
  - El desarrollador eligió tags de modelos, pero Swagger UI no muestra tags sin endpoints. Lo más cercano sin dependencias nuevas: `secciones-modelos.ts` genera, a partir de los schemas `Entidad.*` y `Dto.*` del documento, dos secciones al principio de la página con un desplegable por modelo y una tabla (campo, tipo, obligatorio, descripción, ejemplo). Se arma sola en cada arranque, así que no se desincroniza.
  - Descartado: Redoc en `/docs` (solo lectura, un segundo visor) y endpoints ficticios para colgar los tags.
  - Corrección: un agente había guardado con mala codificación (`CÃ³digo`) las descripciones de `@ApiSchema` de identidad.
  - Verificación: `tsc` y lint OK; capturas de Swagger UI con Playwright para comprobar las secciones y las tablas.
