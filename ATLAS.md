# ATLAS — back-CW-GYM

Mapa del repo para navegar sin recorrer carpetas. **Se actualiza en el mismo commit que crea, mueve o borra un caso de uso, un endpoint o un test.** Estado: 📄 planificado (todavía no existe) · ✅ existe.

## Raíz

| Ruta | Qué es |
| :-- | :-- |
| `CLAUDE.md` | Reglas globales (arquitectura, paquetes, testing, git, IA) |
| `ATLAS.md` | Este mapa |
| `DECISIONES-IA.md` | Auditoría de sesiones con IA |
| `docs/PLANIFICACION.md` | Glosario, decisiones, modelo DDD, US, deuda técnica, OKR y zonas grises |
| `docs/TESTING.md` | Protocolo de testing y TDD |
| `docs/TRAZABILIDAD.md` | Matriz US → RN → caso de uso → test |
| `docs/METRICAS-SPRINT-2.md` | Corte del 14/11: métricas del sprint 2, residual V2, fuentes y pronósticos condicionales |
| `docs/MODELOS-IA.md` | Modelos, delegación y plantillas de prompt |
| `.claude/settings.json` | Permisos: confirmación al editar tests e instalar paquetes |
| `.claude/skills/tdd`, `.claude/skills/coverage` | Skills de TDD y cobertura |
| `test/datasets/` | Fixture del dataset de ejercicios (T01) ✅ |
| `datos/` | Dataset de ejercicios reducido y su licencia (T01) ✅ |
| `test/dobles/` | Dobles de los puertos para los tests unitarios (`identidad.ts`: repositorios, hasheador y emisor de tokens en memoria; `planificacion.ts`: repositorio de rutinas y de planes en memoria, catálogo fijo, vínculos falsos y reloj fijo; `notificaciones.ts`: repositorio de notificaciones en memoria y consulta de profesores fija; `entrenamiento.ts`: repositorio de entrenamientos en memoria y vínculos fijos). Fuera de `src/`, no cuentan en la cobertura ✅ |
| `package.json`, `yarn.lock` | Dependencias exactas, scripts y `resolutions` (regla de las 24 h) ✅ |
| `docker-compose.yml` | Postgres 18 de desarrollo (5442) y de test (5443, en memoria) ✅ |
| `.env.example`, `.env.test` | Variables de entorno: plantilla de desarrollo y valores de test ✅ |
| `vitest.config.ts`, `vitest.int.config.ts`, `vitest.e2e.config.ts` | Unitarios con umbrales de cobertura, integración y e2e ✅ |
| `vitest.cov.config.ts` | `yarn test:cov`: mide unitarios, integración y e2e juntos (requiere `yarn bd:levantar`) ✅ |
| `test/preparar-vitest.ts` | Se carga antes de cada test (`reflect-metadata`) ✅ |
| `eslint.config.js`, `.prettierrc.json` | Lint con las reglas de capas del `CLAUDE.md` y formato ✅ |
| `.husky/`, `scripts/` | Hooks (pre-commit y commit-msg), validador de mensajes y verificación de antigüedad de paquetes ✅ |
| `src/main.ts`, `src/modulo-raiz.module.ts` | Arranque de la API y módulo raíz (configuración y conexión a Postgres) ✅ |
| `src/semillas.ts` | Punto de entrada de `yarn seed`: lista ordenada de semillas ✅ |
| `src/semillas/sembrar-grupos-us12.ts` | Dos grupos de prueba con planes vigentes para US12 ✅ |
| `src/semillas/completar-plan-us12.ts` | Completa el plan del alumno 01 con ejercicios en 28 días mediante `yarn seed:plan-us12` ✅ |
| `src/configurar-aplicacion.ts` | Configuración HTTP común a `main.ts` y a los e2e (`ValidationPipe` con `whitelist`) ✅ |
| `src/compartido/compartido.module.ts` | Kernel compartido: JWT global, `GuardRoles` y `FiltroErrorDominio` registrados como `APP_GUARD` y `APP_FILTER` ✅ |
| `src/compartido/dominio/publicador-eventos/publicador-eventos.puerto.ts` | Puerto `PublicadorEventos` (publica un `EventoDominio`) y su símbolo de inyección ✅ |
| `src/compartido/infraestructura/publicador-eventos/publicador-eventos-en-proceso.ts` | `PublicadorEventosEnProceso`: implementa `PublicadorEventos` y `SuscriptorEventos` (`dominio/publicador-eventos/suscriptor-eventos.puerto.ts`); registra cada evento en el log y ejecuta en orden sus manejadores; si uno falla, lo registra y sigue (US21) ✅ |
| `CHANGELOG.md` | Cambios por versión (decisión 38) ✅ |
| `src/modulos/planificacion/aplicacion/consultar-rutinas/resolver-rutina-para-alumno.ts` | Respuesta de rutina con nombres y objetivos para consultas del Alumno; extracción de US08 para reutilizar en US11 |

## Módulos

| Módulo | Reglas | Fichas | Prefijo RN |
| :-- | :-- | :-- | :-- |
| Identidad y Vínculos | `src/modulos/identidad/CLAUDE.md` | `src/modulos/identidad/FICHAS-TEST.md` | RN-IDE |
| Catálogo | `src/modulos/catalogo/CLAUDE.md` | `src/modulos/catalogo/FICHAS-TEST.md` | RN-CAT |
| Planificación | `src/modulos/planificacion/CLAUDE.md` | `src/modulos/planificacion/FICHAS-TEST.md` | RN-PLAN |
| Entrenamiento | `src/modulos/entrenamiento/CLAUDE.md` | `src/modulos/entrenamiento/FICHAS-TEST.md` | RN-ENT |
| Notificaciones (US21) | `src/modulos/notificaciones/CLAUDE.md` | `src/modulos/notificaciones/FICHAS-TEST.md` | RN-NOT |
| Kernel compartido | `src/compartido/CLAUDE.md` | — | — |

## Casos de uso → endpoint → tests

Base de cada ruta: `src/modulos/<modulo>/aplicacion/<caso-de-uso>/` (una carpeta por caso de uso, con su spec; ver "Carpetas por concepto"). Tests de integración: `test/integracion/<modulo>/`. Tests e2e: `test/e2e/<modulo>/`.

| Módulo | Caso de uso | Endpoint | US | Estado |
| :-- | :-- | :-- | :-- | :-- |
| identidad | `ingresar-al-sistema.caso-uso.ts` | `POST /identidad/ingreso` | US00 | ✅ |
| identidad | `sembrar-admin.caso-uso.ts` | `yarn seed` (CLI, sin endpoint) | US00 | ✅ |
| identidad | `sembrar-usuarios.caso-uso.ts` | `yarn seed` (CLI, sin endpoint) | US00 | ✅ |
| identidad | `dar-alta-profesor.caso-uso.ts` | `POST /identidad/profesores` | US02 | ✅ |
| identidad | `generar-codigo-profesor.caso-uso.ts` | `POST /identidad/profesores/codigo` | US04 | ✅ |
| identidad | `consultar-codigo-profesor.caso-uso.ts` | `GET /identidad/profesores/codigo` | US04 | ✅ |
| identidad | `vincular-alumno.caso-uso.ts` | `POST /identidad/alumnos/vinculo` | US05 | ✅ |
| catalogo | `cargar-dataset-ejercicios.caso-uso.ts` | `yarn seed` (CLI, sin endpoint) | T01 | ✅ |
| catalogo | ~~`registrar-ejercicio.caso-uso.ts`~~ | ~~`POST /catalogo/ejercicios`~~ | US01 (fuera del MVP, DT-06) | — |
| catalogo | `listar-ejercicios.caso-uso.ts` | `GET /catalogo/ejercicios` | T01, US06 | ✅ |
| catalogo | `consultar-ejercicios.caso-uso.ts` | `GET /catalogo/ejercicios/consulta` | T06, T07 | ✅ |
| planificacion | `crear-rutina.caso-uso.ts` | `POST /planificacion/rutinas` | US06, US09, US10, T09 | ✅ bloques (US06), circuitos (US09) y nombre (T09) y mixta con `orden` (US10) |
| planificacion | `consultar-rutinas.caso-uso.ts` | `GET /planificacion/rutinas` | T06 | ✅ |
| planificacion | `renombrar-rutina.caso-uso.ts` | `PATCH /planificacion/rutinas/:id/nombre` | T09 | ✅ |
| planificacion | `consultar-rutinas.caso-uso.ts` (`porId`) | `GET /planificacion/rutinas/:id` | US06 | ✅ `consultar-rutina-por-id.caso-uso.spec.ts` y `test/e2e/planificacion/editar-rutina.e2e-spec.ts` |
| planificacion | `editar-rutina/editar-rutina.caso-uso.ts` | `PUT /planificacion/rutinas/:id` | US06 | ✅ `editar-rutina.caso-uso.spec.ts` y `test/e2e/planificacion/editar-rutina.e2e-spec.ts` |
| planificacion | `importar-rutina/importar-rutina.caso-uso.ts` | `POST /planificacion/rutinas/:id/importacion` | US20 | ✅ copia independiente de rutina propia |
| planificacion | `crear-plan.caso-uso.ts` | `POST /planificacion/planes` | US07 | ✅ |
| identidad | `listar-alumnos-del-profesor.caso-uso.ts` | `GET /identidad/alumnos` | US07 | ✅ |
| planificacion | `alumnos-del-plan/alumnos-del-plan.caso-uso.ts` | `GET/POST /planificacion/planes/:id/alumnos` | US12 | ✅ |
| planificacion | `alumnos-del-plan/alumnos-del-plan.caso-uso.ts` | `DELETE /planificacion/planes/:id/alumnos/:alumnoId` | US12 | ✅ |
| planificacion | `consultar-rutina-del-dia.caso-uso.ts` | `GET /planificacion/mi-rutina-del-dia` (solo Alumno) | US08 | ✅ `consultar-rutina-del-dia.caso-uso.spec.ts`, `consultar-rutina-del-dia-alumnos.caso-uso.spec.ts` y `test/e2e/planificacion/consultar-rutina-del-dia.e2e-spec.ts` |
| planificacion | `consultar-plan-del-alumno/consultar-plan-del-alumno.caso-uso.ts` | `GET /planificacion/mi-plan` (solo Alumno) | US11 | ✅ caso de uso, `consultar-plan-del-alumno.caso-uso.spec.ts` y `test/e2e/planificacion/consultar-plan-del-alumno.e2e-spec.ts` |
| planificacion | `consultar-planes/consultar-planes.caso-uso.ts` | `GET /planificacion/planes` (solo Profesor) | T13 | ✅ `consultar-planes.caso-uso.spec.ts` y `test/e2e/planificacion/consultar-planes.e2e-spec.ts` |
| entrenamiento | `iniciar-entrenamiento.caso-uso.ts` | `POST /entrenamiento/entrenamientos` | US13, T14 | ✅ `test/e2e/entrenamiento/iniciar-entrenamiento.e2e-spec.ts` · `test/e2e/entrenamiento/gif-en-la-copia.e2e-spec.ts` (GIF en la copia, T14) |
| entrenamiento | `consultar-entrenamiento-en-curso.caso-uso.ts` | `GET /entrenamiento/mi-entrenamiento-en-curso` | US13 | ✅ `test/e2e/entrenamiento/iniciar-entrenamiento.e2e-spec.ts` |
| entrenamiento | `registrar-serie-realizada.caso-uso.ts` | `POST /entrenamiento/entrenamientos/:id/series` | US14 | ✅ |
| entrenamiento | `cerrar-entrenamiento.caso-uso.ts`, `calcular-resumen.ts` | `POST /entrenamiento/entrenamientos/:id/finalizacion` | US15, US21 | ✅ `test/e2e/entrenamiento/finalizar-entrenamiento.e2e-spec.ts`; desde US21 publica el evento de la entidad (`eventoDeFin()`) con las series por debajo (`dominio/entrenamiento/series-por-debajo.ts`, `series-por-debajo.spec.ts`) |
| entrenamiento | `registrar-percepcion/registrar-percepcion.caso-uso.ts` | `POST /entrenamiento/entrenamientos/:id/percepcion` (solo Alumno) | US17 | ✅ `registrar-percepcion.caso-uso.spec.ts`, `dominio/percepcion/*.spec.ts` · `test/e2e/entrenamiento/registrar-percepcion.e2e-spec.ts` |
| entrenamiento | `consultar-entrenamientos-de-alumnos.caso-uso.ts` | `GET /entrenamiento/alumnos/:alumnoId/entrenamientos` | US18 | ✅ |
| notificaciones | `notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.ts` | Suscriptor de `EntrenamientoFinalizado` (sin endpoint) | US21 | ✅ `notificar-entrenamiento-por-debajo.caso-uso.spec.ts` · `test/e2e/notificaciones/notificaciones.e2e-spec.ts` |
| notificaciones | `consultar-notificaciones/consultar-notificaciones.caso-uso.ts` | `GET /notificaciones/mis-notificaciones` (solo Profesor) | US21 | ✅ `consultar-notificaciones.caso-uso.spec.ts` · e2e |
| notificaciones | `contar-no-leidas/contar-no-leidas.caso-uso.ts` | `GET /notificaciones/mis-notificaciones/no-leidas` (solo Profesor) | US21 | ✅ `contar-no-leidas.caso-uso.spec.ts` · e2e |
| notificaciones | `marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.ts` | `PUT /notificaciones/mis-notificaciones/:id/lectura` (solo Profesor) | US21 | ✅ `marcar-notificacion-leida.caso-uso.spec.ts` · e2e |
| notificaciones | `sumar-percepcion/sumar-percepcion.caso-uso.ts` | Suscriptor de `PercepcionRegistrada` (sin endpoint) | US17 | ✅ `sumar-percepcion.caso-uso.spec.ts` · `test/e2e/notificaciones/percepcion.e2e-spec.ts` |
| notificaciones | `alertar-incumplimiento-repetido/alertar-incumplimiento-repetido.caso-uso.ts` | Suscriptor de `EntrenamientoFinalizado` (sin endpoint); la alerta sale en `GET /notificaciones/mis-notificaciones` con `tipo` | US23 | ✅ `alertar-incumplimiento-repetido.caso-uso.spec.ts` · `dominio/incumplimiento/racha-incumplimiento.spec.ts` · `test/e2e/notificaciones/incumplimiento-repetido.e2e-spec.ts` |

## Dependencias entre módulos (solo por Fachada o eventos)

| Consumidor | Usa | Para qué |
| :-- | :-- | :-- |
| planificacion | Fachada de identidad | Validar el vínculo alumno-profesor (RN-PLAN-13). ✅ `src/modulos/identidad/fachada-identidad.ts`, por el puerto `ConsultaVinculos` (adaptador en `planificacion/infraestructura/plan/`) |
| planificacion | Fachada de catalogo | Validar ejercicios referenciados y su tipo (RN-PLAN-04, 05, 06). ✅ `src/modulos/catalogo/fachada-catalogo.ts`, por el puerto `ConsultaEjercicios` (adaptador en `planificacion/infraestructura/rutina/`) |
| entrenamiento | Fachada de planificacion | ✅ `fachada-planificacion.ts`: copiar la rutina del día con su orden (RN-ENT-01, 02) |
| entrenamiento | Fachada de identidad | ✅ Peso actual del alumno (RN-ENT-02); profesor para RN-ENT-18 📄 |
| entrenamiento | Fachada de catalogo | ✅ GIF de cada ejercicio para la copia (RN-ENT-02, T14), por el puerto `ConsultaEjercicios` que la Fachada implementa directo. Pendiente: tipo, tipo de carga, factor y grupo (RN-ENT-07, 09, 10) |
| entrenamiento | Fachada de catalogo | ✅ Tipo de carga, factor y grupos para el resumen (RN-ENT-07, 09); récords US16 pendientes |
| notificaciones | Evento `EntrenamientoFinalizado` de entrenamiento | ✅ Observador: `infraestructura/suscriptores/entrenamiento-finalizado.suscriptor.ts`, con contrato propio del evento (RN-NOT-01, US21) |
| notificaciones | Evento `PercepcionRegistrada` de entrenamiento | ✅ `infraestructura/suscriptores/percepcion-registrada.suscriptor.ts`, con contrato propio del evento (RN-NOT-05, 06, 07, US17) |
| notificaciones | Fachada de identidad | ✅ Profesor y nombre del alumno (`obtenerAlumnoPorId`) y profesor de un usuario (`obtenerProfesorPorUsuarioId`), por el puerto `ConsultaProfesores` (`consulta-profesores.fachada-identidad.ts`, US21) |

## Carpetas por concepto

Decidido por Lisandro el 08/11/2026: en **todas las capas** (`dominio/`, `aplicacion/`, `infraestructura/`, `presentacion/`) y en `src/compartido/`, cada concepto tiene su carpeta con el código y su spec juntos, para que la vista no quede con archivos sueltos.

* `dominio/<concepto>/`: la entidad o el objeto de valor y su spec. Los puertos y eventos van en la carpeta del agregado al que pertenecen (`identidad/dominio/profesor/` tiene la entidad, su spec, `repositorio-profesores.puerto.ts` y `generador-codigos.puerto.ts`).
* `aplicacion/<caso-de-uso>/`: el caso de uso, su spec y sus ayudantes. Los muy relacionados comparten carpeta (`identidad/aplicacion/codigo-profesor/`).
* `infraestructura/<concepto>/`: espeja las carpetas de `dominio/` (esquema, mapper, repositorio TypeORM y adaptadores de ese agregado).
* `presentacion/controlador/` tiene el controlador del módulo, y `presentacion/<endpoint>/` el DTO de cada endpoint.

Hoy:

| Módulo | Capa | Carpetas |
| :-- | :-- | :-- |
| catalogo | dominio | ejercicio (con `FiltrosEjercicios`), factor-peso-corporal, musculo, tipo-carga, tipo-ejercicio, dataset |
| catalogo | aplicacion | cargar-dataset-ejercicios, listar-ejercicios, consultar-ejercicios |
| catalogo | infraestructura | ejercicio, dataset |
| catalogo | presentacion | controlador, consultar-ejercicios |
| identidad | dominio | usuario, rol, documento, profesor, alumno |
| identidad | aplicacion | ingresar-al-sistema, sembrar-admin, sembrar-usuarios, dar-alta-profesor, codigo-profesor, vincular-alumno, listar-alumnos-del-profesor |
| identidad | infraestructura | usuario, profesor, alumno |
| identidad | presentacion | controlador, ingreso, alta-profesor, vinculo |
| planificacion | dominio | rutina (con bloque, circuito, `NombreRutina` y los puertos RepositorioRutinas, ConsultaEjercicios y ConsultaNombresEjercicios), plan (con `DiaPlan`, `ValidezPlan` y los puertos RepositorioPlanes y ConsultaVinculos), objetivo-prescripto, pausa, tipo-rutina |
| planificacion | aplicacion | crear-rutina (incluye `resolverContenido`, compartido con editar), editar-rutina, consultar-rutinas (incluye `resolver-rutina-para-alumno.ts`), renombrar-rutina, crear-plan, consultar-rutina-del-dia, consultar-plan-del-alumno, consultar-planes |
| planificacion | infraestructura | rutina, plan |
| planificacion | presentacion | controlador, crear-rutina (incluye `RenombrarRutinaDto`), crear-plan |
| entrenamiento | dominio | entrenamiento (con `CopiaRutina`, `SerieRealizada` valor y evento, `EntrenamientoIniciado`, puertos y `entrenamiento.entidad.spec.ts`), carga-efectiva (con las 4 estrategias), volumen-serie, uno-rm-estimado, marcas-por-tipo-ejercicio (con las 3 estrategias), record-personal (`RecordPersonal`, `RecordBatido` y `DetectorRecords`) |
| entrenamiento | aplicacion | iniciar-entrenamiento, consultar-entrenamiento-en-curso, registrar-serie-realizada, consultar-entrenamientos-de-alumnos |
| entrenamiento | infraestructura | entrenamiento (esquema `series_realizadas` en `serie-realizada.esquema.ts`, `entrenamiento.mapper.ts` y repositorio TypeORM) |
| entrenamiento | presentacion | controlador, registrar-serie-realizada (DTO) |
| notificaciones | dominio | incumplimiento (`racha-incumplimiento` con su spec y el puerto `RepositorioFinalizaciones`, US23), notificacion (`Notificacion` con su spec, `Gravedad` con su spec, `SeriePorDebajo`, `Percepcion`, `EntrenamientoFinalizadoRecibido` y los puertos `RepositorioNotificaciones` y `ConsultaProfesores`) |
| notificaciones | aplicacion | notificar-entrenamiento-por-debajo, consultar-notificaciones, contar-no-leidas, marcar-notificacion-leida |
| notificaciones | infraestructura | incumplimiento (esquema `finalizaciones_alumno` y repositorio TypeORM, US23), notificacion (esquema `notificaciones` con único por `entrenamiento_id`, mapper, repositorio TypeORM y adaptador de la Fachada de identidad), suscriptores (`EntrenamientoFinalizado`) |
| notificaciones | presentacion | controlador |
| compartido | todas | semilla, error-dominio, publicador-eventos, guard-roles, filtro-error-dominio, reloj, paginacion (`dominio/paginacion/paginacion.ts` con `TAMANIOS_PAGINA` y `Pagina<T>`; `presentacion/paginacion/paginacion.dto.ts` con `PaginacionDto`) |

## Nombres de archivo

| Tipo | Patrón | Capa |
| :-- | :-- | :-- |
| Entidad / agregado | `<nombre>.entidad.ts` | dominio |
| Objeto de valor | `<nombre>.valor.ts` | dominio |
| Evento de dominio | `<nombre>.evento.ts` | dominio |
| Puerto | `<nombre>.puerto.ts` | dominio |
| Estrategia | `<nombre>.estrategia.ts` | dominio |
| Caso de uso | `<accion>.caso-uso.ts` | aplicacion |
| Repositorio TypeORM | `<nombre>.repositorio-typeorm.ts` | infraestructura |
| Entidad de persistencia | `<nombre>.esquema.ts` | infraestructura |
| Mapper | `<nombre>.mapper.ts` | infraestructura |
| Controlador | `<modulo>.controlador.ts` | presentacion |
| Módulo Nest | `<modulo>.module.ts` (reemplaza `.modulo.ts`; así lo excluye la cobertura, que ignora `src/**/*.module.ts`) | raíz del módulo |
| Test unitario / integración / e2e | `*.spec.ts` / `*.int-spec.ts` / `*.e2e-spec.ts` | junto al archivo / `test/integracion` / `test/e2e` |
