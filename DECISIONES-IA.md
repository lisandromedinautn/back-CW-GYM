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
