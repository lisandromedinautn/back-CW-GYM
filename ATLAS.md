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
| `test/datasets/` | Dataset de alumnos (T01) 📄 |

## Módulos

| Módulo | Reglas | Fichas | Prefijo RN |
| :-- | :-- | :-- | :-- |
| Identidad y Vínculos | `src/modulos/identidad/CLAUDE.md` | `src/modulos/identidad/FICHAS-TEST.md` | RN-IDE |
| Catálogo | `src/modulos/catalogo/CLAUDE.md` | `src/modulos/catalogo/FICHAS-TEST.md` | RN-CAT |
| Planificación | `src/modulos/planificacion/CLAUDE.md` | `src/modulos/planificacion/FICHAS-TEST.md` | RN-PLAN |
| Entrenamiento | `src/modulos/entrenamiento/CLAUDE.md` | `src/modulos/entrenamiento/FICHAS-TEST.md` | RN-ENT |
| Kernel compartido | `src/compartido/CLAUDE.md` | — | — |

## Casos de uso → endpoint → tests

Base de cada ruta: `src/modulos/<modulo>/aplicacion/`. Tests de integración: `test/integracion/<modulo>/`. Tests e2e: `test/e2e/<modulo>/`.

| Módulo | Caso de uso | Endpoint | US | Estado |
| :-- | :-- | :-- | :-- | :-- |
| identidad | `ingresar-al-sistema.caso-uso.ts` | `POST /identidad/ingreso` | US00 | 📄 |
| identidad | `dar-alta-profesor.caso-uso.ts` | `POST /identidad/profesores` | US02 | 📄 |
| identidad | `generar-codigo-profesor.caso-uso.ts` | `POST /identidad/profesores/codigo` | US04 | 📄 |
| identidad | `vincular-alumno.caso-uso.ts` | `POST /identidad/alumnos/vinculo` | US05 | 📄 |
| identidad | `cargar-dataset-alumnos.caso-uso.ts` | — (comando) | T01 | 📄 |
| catalogo | `registrar-ejercicio.caso-uso.ts` | `POST /catalogo/ejercicios` | US01 | 📄 |
| catalogo | `listar-ejercicios.caso-uso.ts` | `GET /catalogo/ejercicios` | US06 | 📄 |
| planificacion | `crear-rutina.caso-uso.ts` | `POST /planificacion/rutinas` | US06, US09, US10 | 📄 |
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
| planificacion | Fachada de catalogo | Validar ejercicios referenciados y su tipo (RN-PLAN-04, 06) |
| entrenamiento | Fachada de planificacion | Copiar la rutina del día (RN-ENT-01, 02) |
| entrenamiento | Fachada de identidad | Peso actual del alumno y su profesor (RN-ENT-02, 18) |
| entrenamiento | Fachada de catalogo | Tipo, tipo de carga, factor y grupo de cada ejercicio (RN-ENT-07, 09, 10) |

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
| Módulo Nest | `<modulo>.modulo.ts` | raíz del módulo |
| Test unitario / integración / e2e | `*.spec.ts` / `*.int-spec.ts` / `*.e2e-spec.ts` | junto al archivo / `test/integracion` / `test/e2e` |
