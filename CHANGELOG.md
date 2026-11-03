# Changelog — back-CW-GYM

Cambios por versión (decisión 38 de `docs/PLANIFICACION.md`). Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/). Front y back publican la misma `MAJOR.MINOR` en cada hito.

Categorías: Agregado, Cambiado, Corregido, Eliminado, Seguridad. Cada entrada cita su tarjeta.

## [Sin publicar]

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
