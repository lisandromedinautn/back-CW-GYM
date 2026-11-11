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
| `docs/MODELOS-IA.md` | Modelos, delegación y plantillas de prompt |
| `.claude/settings.json` | Permisos: confirmación al editar tests e instalar paquetes |
| `.claude/skills/tdd`, `.claude/skills/coverage` | Skills de TDD y cobertura |
| `test/datasets/` | Fixture del dataset de ejercicios (T01) ✅ |
| `datos/` | Dataset de ejercicios reducido y su licencia (T01) ✅ |
| `test/dobles/` | Dobles de los puertos para los tests unitarios (`identidad.ts`: repositorios, hasheador y emisor de tokens en memoria; `planificacion.ts`: repositorio de rutinas en memoria y catálogo fijo). Fuera de `src/`, no cuentan en la cobertura ✅ |
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
| `src/configurar-aplicacion.ts` | Configuración HTTP común a `main.ts` y a los e2e (`ValidationPipe` con `whitelist`) ✅ |
| `src/compartido/compartido.module.ts` | Kernel compartido: JWT global, `GuardRoles` y `FiltroErrorDominio` registrados como `APP_GUARD` y `APP_FILTER` ✅ |
| `src/compartido/dominio/publicador-eventos/publicador-eventos.puerto.ts` | Puerto `PublicadorEventos` (publica un `EventoDominio`) y su símbolo de inyección ✅ |
| `src/compartido/infraestructura/publicador-eventos/publicador-eventos-log.ts` | `PublicadorEventosLog`: implementación del puerto que solo registra el evento en el log, hasta que haya un suscriptor ✅ |
| `CHANGELOG.md` | Cambios por versión (decisión 38) ✅ |

## Módulos

| Módulo | Reglas | Fichas | Prefijo RN |
| :-- | :-- | :-- | :-- |
| Identidad y Vínculos | `src/modulos/identidad/CLAUDE.md` | `src/modulos/identidad/FICHAS-TEST.md` | RN-IDE |
| Catálogo | `src/modulos/catalogo/CLAUDE.md` | `src/modulos/catalogo/FICHAS-TEST.md` | RN-CAT |
| Planificación | `src/modulos/planificacion/CLAUDE.md` | `src/modulos/planificacion/FICHAS-TEST.md` | RN-PLAN |
| Entrenamiento | `src/modulos/entrenamiento/CLAUDE.md` | `src/modulos/entrenamiento/FICHAS-TEST.md` | RN-ENT |
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
| planificacion | `crear-rutina.caso-uso.ts` | `POST /planificacion/rutinas` | US06, US09, US10, T09 | ✅ bloques (US06), circuitos (US09) y nombre (T09); mixta 📄 (US10) |
| planificacion | `consultar-rutinas.caso-uso.ts` | `GET /planificacion/rutinas` | T06 | ✅ |
| planificacion | `renombrar-rutina.caso-uso.ts` | `PATCH /planificacion/rutinas/:id/nombre` | T09 | ✅ |
| planificacion | `editar-rutina.caso-uso.ts` | `PUT /planificacion/rutinas/:id` | US06 | 📄 |
| planificacion | `importar-rutina.caso-uso.ts` | `POST /planificacion/rutinas/:id/importacion` | US20 | 📄 |
| planificacion | `crear-plan.caso-uso.ts` | `POST /planificacion/planes` | US07 | 📄 |
| planificacion | `agregar-alumno-a-plan.caso-uso.ts` | `POST /planificacion/planes/:id/alumnos` | US12 | 📄 |
| planificacion | `quitar-alumno-de-plan.caso-uso.ts` | `DELETE /planificacion/planes/:id/alumnos/:alumnoId` | US12 | 📄 |
| planificacion | `consultar-rutina-del-dia.caso-uso.ts` | `GET /planificacion/mi-rutina-del-dia` | US08 | 📄 |
| planificacion | `consultar-plan-del-alumno.caso-uso.ts` | `GET /planificacion/mi-plan` | US11 | 📄 |
| entrenamiento | `iniciar-entrenamiento.caso-uso.ts` | `POST /entrenamiento/entrenamientos` | US13 | 📄 |
| entrenamiento | `consultar-entrenamiento-en-curso.caso-uso.ts` | `GET /entrenamiento/mi-entrenamiento-en-curso` | US13 | 📄 |
| entrenamiento | `registrar-serie-realizada.caso-uso.ts` | `POST /entrenamiento/entrenamientos/:id/series` | US14 | 📄 |
| entrenamiento | `finalizar-entrenamiento.caso-uso.ts` | `POST /entrenamiento/entrenamientos/:id/finalizacion` | US15, US16 | 📄 |
| entrenamiento | `registrar-percepcion.caso-uso.ts` | `PUT /entrenamiento/entrenamientos/:id/percepcion` | US17 | 📄 |
| entrenamiento | `consultar-entrenamientos-de-alumnos.caso-uso.ts` | `GET /entrenamiento/alumnos/:alumnoId/entrenamientos` | US18 | 📄 |

## Dependencias entre módulos (solo por Fachada o eventos)

| Consumidor | Usa | Para qué |
| :-- | :-- | :-- |
| planificacion | Fachada de identidad | Validar el vínculo alumno-profesor (RN-PLAN-13) |
| planificacion | Fachada de catalogo | Validar ejercicios referenciados y su tipo (RN-PLAN-04, 05, 06). ✅ `src/modulos/catalogo/fachada-catalogo.ts`, por el puerto `ConsultaEjercicios` (adaptador en `planificacion/infraestructura/rutina/`) |
| entrenamiento | Fachada de planificacion | Copiar la rutina del día (RN-ENT-01, 02) |
| entrenamiento | Fachada de identidad | Peso actual del alumno y su profesor (RN-ENT-02, 18) |
| entrenamiento | Fachada de catalogo | Tipo, tipo de carga, factor y grupo de cada ejercicio (RN-ENT-07, 09, 10) |

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
| identidad | aplicacion | ingresar-al-sistema, sembrar-admin, sembrar-usuarios, dar-alta-profesor, codigo-profesor, vincular-alumno |
| identidad | infraestructura | usuario, profesor, alumno |
| identidad | presentacion | controlador, ingreso, alta-profesor, vinculo |
| planificacion | dominio | rutina (con bloque, circuito, `NombreRutina` y los puertos RepositorioRutinas y ConsultaEjercicios), objetivo-prescripto, pausa, tipo-rutina |
| planificacion | aplicacion | crear-rutina, consultar-rutinas, renombrar-rutina |
| planificacion | infraestructura | rutina |
| planificacion | presentacion | controlador, crear-rutina (incluye `RenombrarRutinaDto`) |
| compartido | todas | semilla, error-dominio, publicador-eventos, guard-roles, filtro-error-dominio, paginacion (`dominio/paginacion/paginacion.ts` con `TAMANIOS_PAGINA` y `Pagina<T>`; `presentacion/paginacion/paginacion.dto.ts` con `PaginacionDto`) |

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
