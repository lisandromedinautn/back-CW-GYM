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
