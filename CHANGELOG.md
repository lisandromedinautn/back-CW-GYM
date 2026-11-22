# Changelog — back-CW-GYM

Cambios por versión (decisión 38 de `docs/PLANIFICACION.md`). Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/). Front y back publican la misma `MAJOR.MINOR` en cada hito.

Categorías: Agregado, Cambiado, Corregido, Eliminado, Seguridad. Cada entrada cita su tarjeta.

## [Sin publicar]

### Agregado

- `yarn seed:plan-us12` carga ejercicios en los 28 días del plan de prueba del alumno 01.

- `yarn seed` prepara dos grupos aislados con planes y alumnos vinculados para probar US12.

- US12: gestión de alumnos de planes vigentes por su profesor, con validaciones de vínculo y plan vigente.

- `GET /planificacion/planes` (Profesor): sus planes paginados (5, 10, 20, 50 o 100), del más nuevo al más viejo, con estado Próximo, Vigente o Finalizado según el reloj y filtros por estado, alumno y rango de fecha de inicio (RN-PLAN-22, RN-PLAN-15; CG-84, T13).

- `POST /entrenamiento/entrenamientos/:id/series` (Alumno): registra una serie realizada del entrenamiento en curso o reemplaza la ya registrada (clave `orden`, `numero` y `posicion`); exige la medida prescripta y publica `SerieRealizada` (RN-ENT-03, 04, 19, 20; US14).

- `GET /entrenamiento/mi-entrenamiento-en-curso` y `POST /entrenamiento/entrenamientos` incluyen `series` en el entrenamiento, para retomarlo (RN-UI-ENT-02; US14).

- `GET /entrenamiento/alumnos/:alumnoId/entrenamientos` (Profesor): los entrenamientos de un alumno vinculado, paginados (5, 10, 20, 50 o 100), del más nuevo al más viejo, con la copia de la rutina, las series realizadas y el estado; un alumno ajeno responde 403 `RN-ENT-18` (US18).

## [1.3.0] — 2026-11-21

Más rutinas e inicio del entrenamiento (fase 3: US09, US10, US20, US11, US13). La fase se terminó el 20/11, dentro del CG Sprint 3.

### Agregado

- Rutinas por circuitos en `POST /planificacion/rutinas`: dos o más ejercicios por circuito, vueltas y macropausa por vuelta (RN-PLAN-01, 03, 04; US09).
- Rutina mixta: `orden` opcional en cada bloque y circuito para fijar la secuencia 1..N; sin `orden` van los bloques y después los circuitos. Las respuestas de crear, consultar y renombrar devuelven el `orden` (RN-PLAN-01; US10).
- `POST /planificacion/rutinas/:id/importacion` crea una copia independiente de una rutina propia con nombre disponible (CG-40, US20).
- `GET /planificacion/mi-plan` (Alumno): consulta su plan vigente completo con los 28 días ordenados, fechas, rutinas con ejercicios y pausas o descansos. Usa la identidad del token y no expone otros alumnos (RN-PLAN-11, 15, 19; US11).
- `POST /entrenamiento/entrenamientos` (Alumno): inicia el entrenamiento del día como copia independiente de la rutina, con el peso corporal del día; uno por alumno y fecha UTC, garantizado en PostgreSQL. Sin plan, en descanso o duplicado responde 409 `RN-ENT-01`. Publica `EntrenamientoIniciado` (RN-ENT-01, 02; CG-46, US13).
- `GET /entrenamiento/mi-entrenamiento-en-curso` (Alumno): devuelve `en-curso`, `abandonado` o `sin-entrenamiento`; a las 00:00 UTC el entrenamiento deja de estar en curso (RN-ENT-20; CG-46, US13).

### Cambiado

- Reutilización del detalle de rutina con nombres en las consultas del Alumno; refactor preparatorio de US11, sin cambiar el contrato de US08.
- RN-PLAN-08: se elimina la pregunta sobre si una rutina importada modificada es una rutina nueva; se mantiene la copia independiente y la restricción a rutinas propias (CG-40, US20).

## [1.2.0] — 2026-11-21

Planificación básica (fase 2: US06, US07, US08) y las tareas técnicas del sprint 2 (T06 a T10). Se publica el 21/11, al cerrar el CG Sprint 2 en Jira. US06 figura Listo en Jira, pero la edición de rutinas (RN-PLAN-07, `PUT /planificacion/rutinas/:id`) todavía no está implementada.

### Agregado

- `POST /planificacion/rutinas` (Profesor): crea una rutina por bloques con ejercicios prescriptos, objetivos y pausas (RN-PLAN-01, 02, 04, 05, 06; US06).
- `GET /planificacion/rutinas` (Profesor): listado paginado de sus rutinas (T08) y `PATCH /planificacion/rutinas/:id/nombre` para renombrarlas; el nombre es opcional al crear (RN-PLAN-21; T09).
- `GET /catalogo/ejercicios/consulta`: ejercicios paginados (5, 10, 20, 50 o 100 por página) con buscador y filtros por atributo (T06, T07).
- Paginación compartida (`Pagina<T>`, `TAMANIOS_PAGINA`, `PaginacionDto`) para los listados (T06).
- Protección de los tests en el hook de commit: aprobación explícita y justificación para modificar un test existente (`scripts/proteger-tests.mjs`; T10).
- `GET /planificacion/mi-rutina-del-dia` (Alumno): consulta su plan vigente y devuelve la rutina con nombres y objetivos de ejercicios, descanso o ausencia de plan. La fecha y el número de día se resuelven en el back (RN-PLAN-11, 15, 18; US08).
- `POST /planificacion/planes` (Profesor): crea un plan de 28 días con la fecha de fin calculada (inicio + 27), una rutina o descanso por día y uno o más alumnos vinculados. Aplica RN-PLAN-08 a 15; el plan no se puede finalizar antes de tiempo (RN-PLAN-17) (US07).
- `GET /identidad/alumnos` (Profesor): lista los alumnos vinculados al profesor, para asignarlos a un plan (US07).
- Puerto compartido `Reloj` (`RelojSistema` en producción, `RelojFijo` en tests), para que la vigencia de un plan no dependa de la fecha real (US07).

### Cambiado

- Métricas del sprint 2 al 14/11: US06 parcial, 26 puntos técnicos del sprint y 52/129 acumulados; residual V2 de 91 puntos con cierre explícito y pronósticos por capacidad. Se conserva la base histórica y se retiran como medición las horas inferidas de commits. Informe en `docs/METRICAS-SPRINT-2.md`.
- Sprints de Jira alineados al calendario el 21/11: Sprint 2 cerrado, Sprint 3 activo y Sprint 4 creado; patrones de diseño aplicados relevados en `docs/PATRONES.md` (T11).

## [1.1.0] — 2026-11-08

Ingreso al sistema con roles, catálogo de ejercicios por dataset, alta de profesores, semilla de usuarios, código de profesor y vínculo alumno-profesor (fase 1: US00, T01, US02, US04, US05; T04 y T05 de planificación).

### Agregado

- `POST /identidad/ingreso` (público): con email y contraseña correctos devuelve un JWT con el rol del usuario; con datos incorrectos responde 401 con RN-IDE-01 sin decir qué dato falló (US00).
- Guard de roles en toda la API: sin token o con token inválido responde 401, y un rol que no corresponde al endpoint responde 403, ambos con RN-IDE-03 (US00).
- Filtro de errores de dominio: cada error responde `{ codigo, mensaje }` con el código HTTP de su categoría (US00).
- `POST /identidad/profesores` (Admin): da de alta un profesor con su legajo y su usuario de rol Profesor. Responde 201 con `{ id, legajo }`; con un legajo, un documento o un email repetidos responde 409 con RN-IDE-04, 06 o 13 (US02).
- `GET /identidad/profesores/codigo` (Profesor): devuelve su Código de Profesor vigente, o `null` si todavía no generó uno (RN-IDE-08) (US04).
- `POST /identidad/profesores/codigo` (Profesor): genera un código nuevo de 6 caracteres que reemplaza al anterior, que deja de vincular alumnos. Responde 201 con `{ codigo }` (RN-IDE-08) (US04).
- `POST /identidad/alumnos/vinculo` (Alumno): vincula al alumno con el profesor cuyo código ingresa y emite `AlumnoVinculado`. Responde 200 con `{ profesor: { nombre, apellido } }`; 400 con RN-IDE-11 si el código no existe o fue regenerado, y 409 con RN-IDE-10 si el alumno ya tiene profesor (US05).
- `yarn seed` crea el Admin inicial con `ADMIN_EMAIL` y `ADMIN_PASSWORD`, de forma idempotente (RN-IDE-14) (US00).
- `yarn seed` crea 3 profesores (P-001 a P-003) y 20 alumnos de prueba, con la contraseña de `SEMILLA_CONTRASENIA` y sin duplicados (RN-IDE-12, 13) (US00).
- Variables de entorno `JWT_SECRETO`, `JWT_EXPIRACION` y `SEMILLA_CONTRASENIA` (US00).
- `yarn seed` carga el catálogo desde `datos/ejercicios-dataset.json`: 1.324 registros reducidos a los campos del modelo, con GIF enlazado y atribución de Gym visual, sin duplicar ejercicios (RN-CAT-07, 08, 09) (T01).
- `GET /catalogo/ejercicios` (Admin y Profesor): lista el catálogo ordenado por nombre, con tipo, tipo de carga, músculo principal y su grupo, músculo secundario, factor de peso corporal y GIF con su atribución (RN-IDE-03, RN-CAT-01, 05) (T01).
- El catálogo valida tipo de ejercicio, tipo de carga, músculos (con su grupo) y factor de peso corporal (RN-CAT-01 a 06) (T01).

### Cambiado

- `yarn test:cov` mide unitarios, integración y e2e juntos, con los umbrales de cobertura (US00).

## [1.0.0] — 2026-11-02

Base técnica (fase 0). Todavía no hay funcionalidades de negocio.

### Agregado

- Proyecto NestJS 12 (ESM) con TypeScript 6 y Node 24 LTS, con las carpetas por módulo y capa (T02).
- Conexión a PostgreSQL 18 con TypeORM y variables de entorno en español; bases dockerizadas de desarrollo (5442) y de test (5443) (T02).
- Vitest en tres niveles (unitario, integración y e2e de API con supertest), con umbrales de cobertura: dominio 80%, resto 70% (T02).
- ESLint con las reglas de dependencia entre capas y módulos del `CLAUDE.md` y la prohibición de `only`/`skip`/`todo`; Prettier (T02).
- Hooks de git: el pre-commit corre lint, formato, tests relacionados y la verificación de paquetes; el commit-msg valida el formato de la decisión 37 (T02).
- Verificación de la regla de las 24 h sobre dependencias directas y transitivas (`yarn verificar:paquetes`) (T02).
- Infraestructura de semillas: puerto `Semilla` y comando `yarn seed` (T02).
- Documentación: planificación v3, plan de implementación por fases, microcommits, versionado y RN-IDE-14 (T03).

### Cambiado

- Testing del back: Vitest en lugar de Jest, porque Nest 12 es solo ESM (decisión 21) (T02).

### Seguridad

- `semver`, `strtok3` y `token-types` llegaron como transitivas con versiones publicadas hacía menos de 24 h; se fijaron con `resolutions` en la versión anterior (T02).
- Riesgo aceptado: `yarn audit` informa una vulnerabilidad moderada en `minimatch@10.2.6` (denegación de servicio por patrones de glob; se corrige recién en la 11). Solo la usan herramientas de desarrollo (ESLint, typescript-eslint, CLI de Nest) sobre patrones propios. Se revisa cuando esas herramientas pasen a `minimatch` 11 (T02).
