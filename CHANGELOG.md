# Changelog — back-CW-GYM

Cambios por versión (decisión 38 de `docs/PLANIFICACION.md`). Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/). Front y back publican la misma `MAJOR.MINOR` en cada hito.

Categorías: Agregado, Cambiado, Corregido, Eliminado, Seguridad. Cada entrada cita su tarjeta.

## [Sin publicar]

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
